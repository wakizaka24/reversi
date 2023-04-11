limactl stop $1
limactl delete $1
limactl start --name=$1 template://docker
limactl stop $1
cp -f ./lima.yaml ~/.lima/$1/lima.yaml
limactl start $1
docker context create lima-$1 --docker "host=unix://~/.lima/$1/sock/docker.sock"
docker context use lima-$1