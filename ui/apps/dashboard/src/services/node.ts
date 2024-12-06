import {
    IResponse,
    karmadaClient,
    Labels,
} from './base';

export interface Node {
    objectMeta: {
        name: string;
        uid: string;
        labels: Labels;
    };
    status: {
        capacity: {
            cpu: string;
            memory: string;
            pods: string;
        };
        addresses: Array<{
            type: string;
            address: string;
        }>;
        conditions: Array<{
            type: string;
            status: string;
            lastHeartbeatTime: string;
            lastTransitionTime: string;
            reason: string;
            message: string;
        }>;
    };
}

export async function GetNodes(clusterName: string) {
    const resp = await karmadaClient.get<
        IResponse<{
            errors: string[];
            listMeta: {
                totalItems: number;
            };
            items: Node[];
        }>
    >(`/member/${clusterName}/node`);
    return resp.data;
}