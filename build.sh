#！/bin/bash
make image-karmada-dashboard-api GOARCH=amd64
docker tag docker.io/karmada/karmada-dashboard-api:member-cluster-api-dev dockerhub.kubekey.local:9443/karmada/karmada-dashboard-api:member-cluster-api-dev
docker push dockerhub.kubekey.local:9443/karmada/karmada-dashboard-api:member-cluster-api-dev
