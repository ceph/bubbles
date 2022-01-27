#!/bin/bash -e

CORRECT_PATH="src/pybind/mgr/bubbles/deploy"
PATH_MSG="The script assumes that you run it inside your ceph clone from '$CORRECT_PATH'"

usage() {
  cat <<EOF
Usage: $0 [option]

options:
  -b, --rebuild              Build new image and push it to your local registry
                               before cluster creation
  -c, --recreate             Create a new cluster based on the last build image

Note:
$PATH_MSG

For debugging run "bash -x $0 [option]"
EOF
}

exists(){
  command -v "$1" >/dev/null 2>&1
}

check_path(){
  if [ $(realpath --relative-to "../../../../../" ".") != $CORRECT_PATH ]; then
    echo $PATH_MSG
    exit 1
  fi
}

step1_run_local_registry(){
  registry_is_running=$(sudo podman ps | grep "registry:2" || :)
  if [ -z "$registry_is_running" ]; then
    sudo mkdir -p /var/lib/registry
    sudo ./run-registry.sh
  fi
}

step2_build_container_image(){
  buildah unshare ./build-container.sh --force --no-registry-tls --registry docker://127.0.0.1:5000
}

prepare_kcli(){
  # Install kcli if not installed
  if ! exists kcli; then
    echo "kcli could not be found"
    echo "(You need to have installed libvirt-dev or libvirt-devel in order for the installation to succeed)"
    curl https://raw.githubusercontent.com/karmab/kcli/master/install.sh | bash
  fi
  # Copy id_rsa.pub into .kcli and add to /root/.ssh/authorized_keys if it does not exist
  klcipub="$HOME/.kcli/id_rsa.pub"
  if [ ! -f "$klcipub" ]; then
    sshpub="$HOME/.ssh/id_rsa.pub"
    cp $sshpub $klcipub
    cat $sshpub | sudo tee -a /root/.ssh/authorized_keys > /dev/null
  fi
}

step3_run_kcli(){
  prepare_kcli
  plan=bubbles
  if [ -n "$(kcli list plan | grep $plan)" ]; then
    kcli delete plan $plan --yes
  fi
  kcli create plan -f plan/cluster.yml -P ceph_dev_folder=$(readlink -v -f "../../../../../") -P registry=docker://127.0.0.1:5000 $plan
  cat <<EOF
You have now accessed your first node of your cluster.

Run the following commands inside it:
# sudo -s

Try to run the following command, if it couldn't be found, try again a minute later, it will come up:
$ cephadm shell

Inside cephadm run:
#$ ceph -s
If the status looks good enable Bubbles as mgr module with:
#$ ceph mgr module enable bubbles
Recheck the status of your cluster if everything is fine, you can exit the cephadm shell.

Get the IP of the node:
# ifconfig eth0 | grep 'inet ' | awk '{print \$2}'
If everything works, Bubbles can be reached from the outside on port 1337 of your node."

EOF
  kcli ssh ceph-node-00
}

all_steps(){
  check_path
  step1_run_local_registry
  step2_build_container_image
  step3_run_kcli
}

image_was_build_and_added(){
  check_path
  step1_run_local_registry
  step3_run_kcli
}

case "$1" in
  -b|--rebuild)
    all_steps
    ;;
  -c|--recreate)
    image_was_build_and_added
    ;;
  *)
    usage
    exit 0
    ;;
esac
