#!/usr/bin/env bash

export PATH=/root/bin:$PATH
mkdir /root/bin
{% if ceph_dev_folder is defined %}
  cp /mnt/{{ ceph_dev_folder }}/src/cephadm/cephadm /root/bin/cephadm
  sed -i 's/python3.6/python3.8/g' /root/bin/cephadm
{% else %}
  pushd /root/bin
  curl --silent --remote-name \
    --location \
    https://raw.githubusercontent.com/ceph/ceph/master/src/cephadm/cephadm
  popd
{% endif %}
chmod +x /root/bin/cephadm
mkdir -p /etc/ceph
mon_ip=$(ifconfig eth0  | grep 'inet ' | awk '{ print $2}')
{% if ceph_dev_folder is defined %}
  podman pull --tls-verify=false \
    docker://{{ registry }}/opensuse/bubbles:master

  cephadm --image {{ registry }}/opensuse/bubbles:master \
    bootstrap \
    --skip-pull \
    --mon-ip $mon_ip \
    --initial-dashboard-password {{ admin_password }} \
    --allow-fqdn-hostname \
    --dashboard-password-noupdate \
    --shared_ceph_folder /mnt/{{ ceph_dev_folder }}
{% else %}
  podman pull --tls-verify=false \
    docker://{{ registry }}/opensuse/bubbles:master

  cephadm --image {{registry}}/opensuse/bubbles:master \
    bootstrap \
    --skip-pull \
    --mon-ip $mon_ip \
    --initial-dashboard-password {{ admin_password }} \
    --allow-fqdn-hostname \
    --dashboard-password-noupdate
{% endif %}
fsid=$(cat /etc/ceph/ceph.conf | grep fsid | awk '{ print $3}')
{% for number in range(1, nodes) %}
  ssh-copy-id -f -i /etc/ceph/ceph.pub  -o StrictHostKeyChecking=no root@{{ prefix }}-node-0{{ number }}.{{ domain }}
{% endfor %}
