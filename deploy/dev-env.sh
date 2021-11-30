#!/bin/bash -e

exists(){
  command -v "$1" >/dev/null 2>&1
}

step1_run_local_registry(){
  registry_is_running=$(podman ps | grep "registry:2")
  if [ -z "$registry_is_running" ]; then
    registry=$HOME/local-bubbles-registry
    mkdir -p $registry
    podman run --privileged -d \
            --name registry \
            -p 5000:5000 \
            -v $registry:/var/lib/registry \
            --restart=always registry:2
  fi
}

step2_build_container_image(){
  if ! exists zypper; then
    vagrant box update --force
    vagrant up
    vagrant ssh -c "cd /ceph/src/pybind/mgr/bubbles/deploy; ./run-in-vagrant.sh"
    echo "Running script to load the image in 10 seconds"
    sleep 10
    ./load-image.sh
    vagrant destroy -f
  else
    ./build-container.sh --force
  fi
}

step3_push_to_local_registry(){
  podman push \
      --tls-verify=false \
      localhost/opensuse/bubbles:master \
      docker://127.0.0.1:5000/opensuse/bubbles:master
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

step4_run_kcli(){
  prepare_kcli
  plan=bubbles
  if [ -n "$(kcli list plan | grep $plan)" ]; then
    sudo kcli delete plan $plan --yes
  fi
  sudo kcli create plan -f plan/cluster.yml -P ceph_dev_folder=$(readlink -v -f "../../../../../") -P registry=192.168.122.1:5000 $plan
  echo "Run the following commands inside your first node:"
  echo "sudo -s"
  echo "cephadm shell"
  echo "ceph mgr module enable bubbles"
  echo "exit; ifconfig eth0 | grep 'inet ' | awk '{print \$2}'; exit; exit"
  sudo kcli ssh ceph-node-00
  echo "If everything works, Bubbles should be reachable on port 1337 on the above IP."
}

all_steps(){
  step1_run_local_registry
  step2_build_container_image
  step3_push_to_local_registry
  step4_run_kcli
}

image_was_build_and_added(){
  step1_run_local_registry
  step4_run_kcli
}

case "$1" in
rebuild)
    all_steps
    ;;
recreate)
    image_was_build_and_added
    ;;
*)
    echo "Usage: $0 <command>"
    echo -e "\nAvailable commands:"
    echo -e "  rebuild \t Build new image, add it to local registry and create a new bubbles cluster based on the new image"
    echo -e "  recreate \t Create a new bubbles cluster based on the already build image"
    echo -e "\nFor debugging run \"bash -x $0 <command>\""
    exit 1
esac
