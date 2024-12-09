import {
    convertDataSelectQuery,
    DataSelectQuery,
    IResponse,
    karmadaClient,
} from '../base';

export interface Pod {
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

export async function GetMemberPods(params: {clustername: string;}, query: DataSelectQuery) {
    const { clustername } = params;
    const resp = await karmadaClient.get<
        IResponse<{
            errors: string[];
            listMeta: {
                totalItems: number;
            };
            items: Pod[];
        }>
    >(`/member/${clustername}/pod`, {
        params: convertDataSelectQuery(query),
    });
    return resp.data;
}