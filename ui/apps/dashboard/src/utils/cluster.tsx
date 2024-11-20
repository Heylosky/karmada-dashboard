import { GetClusters } from "@/services";
import { IResponse } from "@/services/base";
import { ListClusterResp } from "@/services/cluster";

interface ClusterConfig {
    title: string;
}

export function getClusterTitle(lang: string) {
    return clusterConfig[lang]?.title || '';
}

export let clusterConfig: Record<string, ClusterConfig> = {};

// 使用 GetClusters 方法获取后端数据并更新 clusterConfig
export async function fetchAndUpdateClusterConfig() {
    try {
        const response: IResponse<ListClusterResp> = await GetClusters();
        
        if (response.code === 200) {
            response.data.clusters.forEach(cluster => {
                clusterConfig[cluster.objectMeta.name] = {
                    title: cluster.objectMeta.name,
                };
            });
        } else {
            console.error('Error fetching clusters:', response.message);
        }
    } catch (error) {
        console.error('Failed to fetch clusters:', error);
    }
}