import {
    convertDataSelectQuery,
    DataSelectQuery,
    IResponse,
    karmadaClient,
    WorkloadKind,
} from '@/services/base.ts';
import {
    Workload,
    WorkloadStatus,
    WorkloadDetail,
    WorkloadEvent
} from '../workload'

export async function GetMemberWorkloads(params: {
    clustername: string;
    namespace?: string;
    kind: WorkloadKind;
    keyword?: string;
}) {
    const { clustername, kind, namespace } = params;
    const requestData = {} as DataSelectQuery;
    if (params.keyword) {
        requestData.filterBy = ['name', params.keyword];
    }
    const url = namespace ? `/member/${clustername}/${kind}/${namespace}` : `/member/${clustername}/${kind}`;
    const resp = await karmadaClient.get<
        IResponse<{
            errors: string[];
            listMeta: {
                totalItems: number;
            };
            status: WorkloadStatus;
            deployments?: Workload[];
            statefulSets?: Workload[];
            daemonSets?: Workload[];
        }>
    >(url, {
        params: convertDataSelectQuery(requestData),
    });
    return resp.data;
}

export async function GetMemberWorkloadDetail(params: {
    clustername: string;
    namespace?: string;
    name: string;
    kind: WorkloadKind;
}) {
    const { clustername, kind, name, namespace } = params;
    const url = `/member/${clustername}/${kind}/${namespace}/${name}`;
    const resp = await karmadaClient.get<
        IResponse<
            {
                errors: string[];
            } & WorkloadDetail
        >
    >(url);
    return resp.data;
}

export async function GetMemberWorkloadEvents(params: {
    clustername: string;
    namespace: string;
    name: string;
    kind: WorkloadKind;
}) {
    const { clustername, kind, name, namespace } = params;
    const url = `/member/${clustername}/${kind}/${namespace}/${name}/event`;
    const resp = await karmadaClient.get<
        IResponse<{
            errors: string[];
            listMeta: {
                totalItems: number;
            };
            events: WorkloadEvent[];
        }>
    >(url);
    return resp.data;
}