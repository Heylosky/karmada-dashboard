#！/bin/bash
rm -rf ./cluster/images/._*
rm -rf ./cluster/images/.D*
make image-karmada-dashboard-api GOARCH=amd64
docker tag docker.io/karmada/karmada-dashboard-api:membercluster-node-status dockerhub.kubekey.local:9443/karmada/karmada-dashboard-api:node-detail
docker push dockerhub.kubekey.local:9443/karmada/karmada-dashboard-api:node-detail
