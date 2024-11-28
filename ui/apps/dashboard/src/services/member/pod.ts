import { karmadaClient } from '../base';

// 定义 PodList 接口
export interface PodList {
    items: PodDetail[];
}

// 定义 PodDetail 接口
export interface PodDetail {
    objectMeta: {
        name: string;
        namespace: string;
        labels?: { [key: string]: string };
        annotations?: { [key: string]: string };
        creationTimestamp: string;
        uid: string;
    };
    status: {
        conditions: PodCondition[];
    };
}

interface PodCondition {
    type: string;
    status: boolean;
    lastProbeTime: string;
    lastTransitionTime: string;
}

export async function GetPodDetail(clusterName: string) {
    const resp = await karmadaClient.get(
        `/member/${clusterName}/pod`,
    );
    return resp.data;
}
