import { karmadaClient } from './base';

export interface ObjectMeta {
    name: string;
    creationTimestamp: string;
    uid: string;
    labels?: Record<string, string>;
}

export interface TypeMeta {
    kind: string;
}

export interface Node {
    objectMeta: ObjectMeta;
    typeMeta: TypeMeta;
}

export async function GetNodeDetail(clusterName: string) {
    const resp = await karmadaClient.get(
        `/member/${clusterName}/node`,
    );
    return resp.data;
}