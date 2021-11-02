#!/bin/bash

usage() {
  cat <<EOF
usage: $0 [options]

options:
  -p|--port <NUMBER>      Specify local port number.
  -s|--storage <PATH>     Specify local registry storage path.
  -h|--help               This message.

EOF
}

port=5000
storage=/var/lib/registry

while [[ $# -gt 0 ]]; do
  case $1 in
    -p|--port)
      port=$2
      shift 1
      ;;
    -s|--storage)
      storage=$2
      shift 1
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "error: unrecognized option '$1'" >/dev/stderr
      exit 1
      ;;
  esac
  shift 1
done

[[ -z "${port}" ]] && \
  echo "error: missing port" >/dev/stderr && \
  usage && \
  exit 1

[[ -z "${storage}" ]] && \
  echo "error: missing storage path" >/dev/stderr && \
  usage && \
  exit 1

[[ ! -d "${storage}" ]] && \
  echo "error: storage path at '${storage}' does not exist" >/dev/stderr && \
  exit 1

sudo podman run --privileged -d --name registry -p 5000:${port} \
  -v ${storage}:/var/lib/registry \
  --restart=always \
  registry:2

