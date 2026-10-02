import type {
	IDataObject,
	IExecuteSingleFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	ILoadOptionsFunctions,
} from 'n8n-workflow';

export type ChattieListResponse<T> = {
	object: 'list';
	data: T[];
	has_more: boolean;
	next_cursor: string | null;
};

export async function chattieApiRequest<T = IDataObject>(
	this: ILoadOptionsFunctions | IExecuteSingleFunctions,
	method: IHttpRequestMethods,
	path: string,
	qs: IDataObject = {},
	body: IDataObject | undefined = undefined,
): Promise<T> {
	const credentials = await this.getCredentials<{ baseUrl?: string }>('chattieApi');
	const baseUrl = (credentials.baseUrl || 'https://app.trychattie.com').replace(/\/+$/, '');

	const options: IHttpRequestOptions = {
		method,
		url: `${baseUrl}${path}`,
		qs,
		body,
		json: true,
	};

	return (await this.helpers.httpRequestWithAuthentication.call(this, 'chattieApi', options)) as T;
}
