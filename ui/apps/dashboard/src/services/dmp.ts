export function NavigateToDMP(clusterName: string): void {
  const url =
    'http://192.168.195.10:7443/apis/cluster.karmada.io/v1alpha1/clusters/' +
    clusterName +
    '/proxy/api/v1/namespaces/scfdev/services/dmp-agent/proxy/';
  window.open(url, '_blank');
}
