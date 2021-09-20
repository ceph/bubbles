# Deploying Bubbles for Development

Given Bubbles is not part of the main Ceph distribution, we need to take a few
steps to get Bubbles running as a module served by ceph-mgr.

It might seem a bit convoluted at this point, but we will do our best attempts
to simplify the process in the future.


## Requirements

We will be relying heavily on [kcli](https://github.com/karmab/kcli), which is
already being used for [orchestrator and dashboard development][1], given it's able
to easily deploy VMs with libvirt.

Additionally, we need to build a new container image with the Ceph binaries. We
can't simply use the vanilla upstream container because we have certain
dependencies not installed in said container.

Finally, we'll need to serve the built image from a local registry so that
`cephadm` is able to consume it when deploying the cluster.

[1]: https://docs.ceph.com/en/latest/dev/cephadm/developing-cephadm/#kcli-a-virtualization-management-tool-to-make-easy-orchestrators-development


### NOTE BEFORE

Because libpython3.6 does not play well with asyncio's event loop, for reasons
unknown at the time, we are limited to running containers with binaries built
and linked against libpython3.8+.

Unfortunately this means that we can't be using the upstream containers as
base for our images, since these are based on a python 3.6 release.

We have thus moved to containers we know are built against python 3.8, coming
from opensuse's registry. However, these are built solely for Pacific, instead
of following Ceph's master branch.

Until this is ironed out, we are bound by the Pacific release. This also means
that we will be grabbing a Pacific `cephadm` from the upstream repositories,
instead of relying on the currently available version in the developer's
machine. This is a nasty kludge, but will get us through this dark period.

### libvirt

Our VMs, deployed with `kcli`, will be run with `libvirt`. Thus, one needs
`libvirt` installed in the system, and the `libvirtd` systemd service should be
running.

Additional requirements are an existing network and a default storage pool, but
we find configuring that is beyond the scope of this document.

### kcli

We recommend running kcli from a virtualenv, simply because it's the simplest
way to do it, installing it with `pip install kcli`.

Once kcli is available, we will rely on the plan we provide in the `plan/`
directory, and deploy a new cluster. The plan itself, `plan/cluster.yml`, has
been copied from the Ceph dashboard's CI plan for kcli. We differ from the
original setup through the `plan/bootstrap_cluster.sh` script, which we have
modified to account for the local registry we pull from.

Additionally, `kcli` will require an `id_rsa.pub` key to be made available to
copy to the deployed VMs. According to [kcli's documentation][2], this should
be living in `$HOME/.kcli/`, but we found that any `id_rsa.pub` living in
`$HOME/.ssh/` will do the trick.

[2]: https://kcli.readthedocs.io/en/latest/

Unfortunately, we also found that `kcli` is going to require `ssh` access to the
host's root account to perform certain operations, such as mounting the host's
filesystem onto the guest VMs. We haven't quite figured out how to avoid that.
Therefore, the `id_rsa.pub` key used by `kcli` will need to be added to
`/root/.ssh/authorized_keys`.

### podman

To build the container image and run the registry, we are going to need podman,
which should be installed through whatever package repository and tool one's
distro uses.


### Ceph

We are going to need a Ceph source tree to be available for export to the VMs.
Technically we only require the Python bits used by the `ceph-mgr`, but because
a lot of these are spread throughout the `ceph.git` source tree, the scripts we
rely on expect a full source tree to be made available.

We will also need to include Bubbles in this tree. The simples way is to clone
`bubbles.git` into Ceph's `src/pybind/mgr/bubbles`. Alternatively, one could
clone `bubbles.git` to some other place in the filesystem, and bind mount it to
the Ceph tree, such as

```
    mount --bind /home/foo/code/bubbles.git /home/foo/code/ceph/src/pybind/mgr/bubbles
```

But this is a matter of taste, and it really doesn't matter in the end.

## Deployment

### How it works

In order to run a development version of Bubbles, we will rely on a slight hack
provided by `cephadm` that our `kcli` plan takes advantage of. Essentially, at
deployment time, `cephadm` will write down the `ceph-mgr` systemd unit file with
the correct parameters to mount a directory from the container's host system on
the container's numerous `ceph-mgr`-specific paths, like `/usr/share/ceph/mgr/`.

Therefore, the guest VMs need to have a mount from the host system mounted
somewhere, which `cephadm` will then pass on to the VMs `ceph-mgr` containers.
`kcli` takes care of that step, by sharing a host system's directory with the
guest VMs, mounting it under the VM's `/mnt/` directory.

Seems a bit convoluted, but it works.


### Step 1: Create container image

First of all, we'll need to create the container image we'll be using to deploy
Bubbles. This image will be based off the Ceph upstream's master container
image, with additional dependencies we require (`fastapi`, `uvicorn`, etc)
installed through `pip`.

To do so, running the following should suffice:

```
    # sudo podman build container/ -t ceph/bubbles:master
```

Running `podman images` should now show a `localhost/ceph/bubbles` image tagged
with `master`. The name is relevant because that's the image name and tag we'll
be pulling to deploy with `cephadm`.


### Step 2: Run a local registry

By default `cephadm` will pull from Ceph's repository at `quay.io`. Because we
want to run our own purpose-built image we'll need to provide a different
repository. This could be done with an additional repository at `quay.io` or
somewhere else, but a local registry is easier.

In this example we'll be running the registry with a volume mount from
`/var/lib/containers/registry`, but this could technically be any other
directory in the system.

```
    sudo podman run --privileged -d \
        --name registry \
        -p 5000:5000 \
        -v /var/lib/containers/registry:/var/lib/registry \
        --restart=always registry:2
```


### Step 3: Push image to local registry

Because we are running an insecure registry, we will need to account for that
when pushing our image. The `kcli` plan's script also accounts for that fact.

One can push our local image to the registry by running

```
    sudo podman push \
        --tls-verify=false \
        localhost/ceph/bubbles:master \
        docker://127.0.0.1:5000/ceph/bubbles:master
```


### Step 4: Run `kcli`

First, we need to check a few bits of information:

 1. Location for the Ceph's source tree that includes Bubbles. We will be
 assuming it is located at `/code/ceph`.

 2. IP address for the host's `libvirt` network, because we will need to point
 the guest VMs to the local registry we deployed before. Typically this will be
 a `virbr` interface. We will be assuming it's `192.168.122.1`.

Deploying a three node Ceph cluster, bootstrapped by `cephadm`, becomes a
trivial task:

```
    kcli kcli create plan -f plan/cluster.yml -P ceph_dev_folder=/code/ceph -P registry=192.168.122.1:5000
```

Once `kcli` finishes deploying, one should be able to access the first node with
`kcli ssh ceph-node-00`. It may take a while for the VM to install required
packages and pull the container image, but once that is done one should be able
to start a `cephadm shell` as root, and interact with the cluster.


### Step 5: Enable Bubbles

Bubbles will be disabled by default. Once the Ceph cluster has been
bootstrapped, one should be able to enable Bubbles:

```
    $ sudo -s
    # cephadm shell
    # ceph mgr module enable bubbles
```

Lest an error occur, Bubbles should now be enabled and serving on the VM's port 1337.


### Step 6: Accessing Bubbles

Most developers will likely run the development environment on their local
machine. As such, accessing Bubbles is a matter of figuring out the VM's IP
address and accessing it via the browser on port 1337.

Figuring out the VM's IP address is a matter of running `ip addr` on the VM. By
default, the plan deploys VMs with a single NIC, so it should be easy to spot.
Alternatively, one can run

```
    # ifconfig eth0 | grep 'inet ' | awk '{print $2}'
```

Which will provide the configured IP address for the single NIC available in the
machine.

Assuming the VM has the address `192.168.122.45`, Bubbles should be served at
`http://192.168.122.45:1337`.


### (Optional) Step 7: Forwarding ports to access Bubbles

For those selected few that develop on a remote server, the VM addresses won't
be exposed to the network. Forwarding ports will be necessary. The simplest way
to do so is by using `ssh`.

Assuming the development server can be reached at `foo.lab`, and assuming the
same IP address for the VM as above, the following command should get one going:

```
    ssh -L localhost:1234:192.168.122.45:1337 foo.lab
```
