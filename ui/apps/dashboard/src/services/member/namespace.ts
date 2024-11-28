import {
    convertDataSelectQuery,
    DataSelectQuery,
    IResponse,
    karmadaClient,
} from '../base';

import { Namespace } from '../namespace';

export async function GetMemberNamespaces(params: {clustername: string;}, query: DataSelectQuery) {
    const { clustername } = params;
    const resp = await karmadaClient.get<
        IResponse<{
            errors: string[];
            listMeta: {
                totalItems: number;
            };
            namespaces: Namespace[];
        }>
    >(`/member/${clustername}/namespace`, {
        params: convertDataSelectQuery(query),
    });
    return resp.data;
}

export async function CreateMemberNamespace(params: {
    name: string;
    skipAutoPropagation: boolean;
}) {
    const resp = await karmadaClient.post<IResponse<string>>(
        '/namespace',
        params,
    );
    return resp.data;
}