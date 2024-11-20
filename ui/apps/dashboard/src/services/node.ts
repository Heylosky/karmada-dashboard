import { karmadaClient } from './base';

// export interface ObjectMeta {
//     name: string;
//     creationTimestamp: string;
//     uid: string;
//     labels?: Record<string, string>;
// }

// export interface TypeMeta {
//     kind: string;
// }

// export interface Node {
//     objectMeta: ObjectMeta;
//     typeMeta: TypeMeta;
// }

export interface NodeDetail {
    items: Array<{
        objectMeta: {
            name: string;
            uid: string;
            labels?: { [key: string]: string }; // 可选的 labels 属性
        };
        status: {
            capacity: {
                cpu: string;
                memory: string;
                pods: string;
            };
            addresses?: Array<{
                type: string;
                address: string;
            }>; // 可选的 addresses 属性
            conditions?: Array<{
                type: string;
                status: string;
                lastHeartbeatTime: string;
                lastTransitionTime: string;
                reason: string;
                message: string;
            }>; // 可选的 conditions 属性
        };
    }>;
}

export async function GetNodeDetail(clusterName: string) {
    const resp = await karmadaClient.get(
        `/member/${clusterName}/node`,
    );
    return resp.data;
}