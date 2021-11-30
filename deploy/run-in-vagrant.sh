#!/bin/bash

# Set storge conf as needed

# Install everything that's needed
sudo zypper in -y libvirt libvirt-devel podman buildah nodejs-common npm14
curl https://raw.githubusercontent.com/karmab/kcli/master/install.sh | bash

sudo sed -i 's/driver = ""/driver = "overlay"/' /etc/containers/storage.conf
./build-container.sh --force
if [ -z "$(sudo podman images | grep bubbles)" ]; then
  echo "Image could not be created!"
  echo "I will rerun the script now without clearing dist - mostly it works on the second time."
  ./build-container.sh --skip-dist
  if [ -z "$(sudo podman images | grep bubbles)" ]; then
    echo "Image could still not be created!"
    exit;
  fi
fi

image=$(sudo podman images | grep bubbles)
name=$(echo $image | awk '{print $1}')
tag=$(echo $image | awk '{print $2}')
imageId=$(echo $image | awk '{print $3}')
saveName="bubbles-image.tar"
scriptName="load-image.sh"

if test -f "$saveName"; then
  sudo rm $saveName
fi
sudo podman save -o $saveName $imageId

cat <<EOF > $scriptName
#!/bin/bash
podman load -i $saveName
podman tag $imageId $name:$tag
EOF
chmod +x $scriptName

echo "Now run ./$scriptName to load the build image on the host."
echo "Have a nice day \o/"
sudo poweroff
