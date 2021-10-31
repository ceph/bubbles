#!/bin/bash
# bubbles - a simplified management UI for Ceph
# Copyright (C) 2021 SUSE, LLC
#
# This library is free software; you can redistribute it and/or
# modify it under the terms of the GNU Lesser General Public
# License as published by the Free Software Foundation; either
# version 2.1 of the License, or (at your option) any later version.
#

image_name="opensuse/bubbles:master"


err() {
  echo "$1" >/dev/stderr
}


usage() {
  cat << EOF
usage: $0 [options]

options:
  --force                Blow away any 'dist' directory if present.
  --skip-dist            Skip aggregating the set of files.
                         Presumes a 'dist' directory exists already.
  --image-name NAME      Final image name (default: ${image_name})
  --registry URL         Push to registry
  --no-registry-tls      Disable registry TLS verification.
  --no-sudo              Don't require root super powers. Useful when podman
                         is able to run unprivileged.
  --help|-h              This message

EOF
}

mkdist() {
  mkdir dist

  pushd ../frontend
  npm install || exit 1
  ng build \
    --output-hashing all \
    --configuration production \
    --output-path ../deploy/dist/frontend/dist || exit 1
  popd

  pushd ..
  find backend -iname '*pycache*' -prune -false -o -iname '*.py' | \
    xargs cp --parents --target-directory=deploy/dist
  cp LICENSE README.md COPYING bubbles.py module.py __init__.py deploy/dist/
  popd
}

if ! buildah >&/dev/null ; then
  err "unable to find 'buildah'. Please make sure it's installed."
  exit 1
fi

skip_dist=false
registry=
has_registry=false
registry_args=
no_sudo=false
use_force=false

while [[ $# -gt 0 ]]; do

  case $1 in
    --help|-h) usage ; exit 0 ;;
    --force) use_force=true ;;
    --skip-dist) skip_dist=true ;;
    --image-name) image_name=$2 ; shift 1 ;;
    --registry) registry=$2 ; has_registry=true ; shift 1 ;;
    --no-registry-tls) registry_args="--tls-verify=false" ;;
    --no-sudo) no_sudo=true ;;
    *)
      err "unknown option: '$1'"
      usage
      exit 1
      ;;
  esac
  shift 1

done

[[ $(id -u) -ne 0 ]] && ! $no_sudo && \
  err "Must be run as root. Pass '--no-sudo' to run unprivileged." && \
  exit 1

[[ -z "${image_name}" ]] && \
  err "image name not specified" && \
  exit 1

${has_registry} && [[ -z "${registry}" ]] && \
  err "registry URL not specified" && \
  exit 1

if ! $skip_dist ; then
  if [[ -d "dist" ]]; then
    if ! $use_force ; then
      err "'dist' directory already exists. Please remove it first."
      exit 1
    else
      echo "Blowing away existing 'dist' directory"
      rm -fr dist >&/dev/null
    fi
  fi
  mkdist
elif [[ ! -d "dist" ]]; then
  err "missing 'dist' directory"
  exit 1
fi

ctr=$(sudo buildah from \
  registry.opensuse.org/filesystems/ceph/master/upstream/images/opensuse/ceph/ceph:latest)

[[ -z "${ctr}" ]] && err "error obtaining base container" && exit 1

buildah run ${ctr} zypper install -y python38-pip || exit 1
buildah run ${ctr} pip install $(cat ../requirements.txt) || exit 1

mnt=$(sudo buildah mount ${ctr})
[[ -z "${mnt}" ]] && err "error mounting container" && exit 1

cp -R dist/ ${mnt}/usr/share/ceph/mgr/bubbles || exit 1

buildah unmount ${ctr} || exit 1
buildah commit ${ctr} ${image_name} || exit 1
buildah rm ${ctr} || exit 1

if $has_registry ; then
  podman push ${registry_args} \
    localhost/${image_name} ${registry}/${image_name}
fi

