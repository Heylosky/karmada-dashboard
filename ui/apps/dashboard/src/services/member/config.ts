import {
  convertDataSelectQuery,
  DataSelectQuery,
  IResponse,
  karmadaClient,
  ObjectMeta,
  TypeMeta,
} from '@/services/base.ts';

export interface Config {
  objectMeta: ObjectMeta;
  typeMeta: TypeMeta;
}

export async function GetMemberConfigMaps(params: {
  clustername: string;
  namespace?: string;
  keyword?: string;
}) {
  const { clustername, namespace, keyword } = params;
  const url = namespace ? `/member/${clustername}/configmap/${namespace}` : `/member/${clustername}/configmap`;
  const requestData = {} as DataSelectQuery;
  if (keyword) {
    requestData.filterBy = ['name', keyword];
  }
  const resp = await karmadaClient.get<
    IResponse<{
      errors: string[];
      listMeta: {
        totalItems: number;
      };
      items: Config[];
    }>
  >(url, {
    params: convertDataSelectQuery(requestData),
  });
  return resp.data;
}

export async function GetMemberConfigMapDetail(params: {
  clustername: string;
  namespace: string;
  keyword?: string;
  name: string;
}) {
  const { clustername, namespace, keyword, name } = params;
  const url = `/member/${clustername}/configmap/${namespace}/${name}`;
  const requestData = {} as DataSelectQuery;
  if (keyword) {
    requestData.filterBy = ['name', keyword];
  }
  const resp = await karmadaClient.get<
    IResponse<{
      errors: string[];
      listMeta: {
        totalItems: number;
      };
      items: Config[];
    }>
  >(url, {
    params: convertDataSelectQuery(requestData),
  });
  return resp.data;
}

export interface Secret {
  objectMeta: ObjectMeta;
  typeMeta: TypeMeta;
}

export async function GetMemberSecrets(params: {
  clustername: string;
  namespace?: string;
  keyword?: string;
}) {
  const { clustername, namespace, keyword } = params;
  const url = namespace ? `/member/${clustername}/secret/${namespace}` : `/member/${clustername}/secret`;
  const requestData = {} as DataSelectQuery;
  if (keyword) {
    requestData.filterBy = ['name', keyword];
  }
  const resp = await karmadaClient.get<
    IResponse<{
      errors: string[];
      listMeta: {
        totalItems: number;
      };
      secrets: Secret[];
    }>
  >(url, {
    params: convertDataSelectQuery(requestData),
  });
  return resp.data;
}

export async function GetMemberSecretDetail(params: {
  clustername: string;
  namespace: string;
  keyword?: string;
  name: string;
}) {
  const { clustername, namespace, keyword, name } = params;
  const url = `/member/${clustername}/secret/${namespace}/${name}`
  const requestData = {} as DataSelectQuery;
  if (keyword) {
    requestData.filterBy = ['name', keyword];
  }
  const resp = await karmadaClient.get<
    IResponse<{
      errors: string[];
      listMeta: {
        totalItems: number;
      };
      secrets: Secret[];
    }>
  >(url, {
    params: convertDataSelectQuery(requestData),
  });
  return resp.data;
}
