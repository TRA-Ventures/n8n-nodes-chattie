import {
	randomString,
	type IDataObject,
	type IExecuteSingleFunctions,
	type IHttpRequestOptions,
	type INodeExecutionData,
	type PostReceiveAction,
} from 'n8n-workflow';

/**
 * Chattie requires an `Idempotency-Key` header on create-style endpoints. Use the one
 * the user set under Options, or generate a fresh one per request.
 */
export async function addIdempotencyKey(
	this: IExecuteSingleFunctions,
	requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
	const customKey = this.getNodeParameter('options.idempotencyKey', '') as string;
	const key = customKey || `n8n-${this.getExecutionId()}-${randomString(16)}`;

	requestOptions.headers = { ...requestOptions.headers, 'Idempotency-Key': key };
	return requestOptions;
}

/**
 * Returns a postReceive action that keeps only `fields` on each item when the
 * node's "Simplify" toggle is on.
 */
export function simplifyOutput(fields: string[]): PostReceiveAction {
	return async function (
		this: IExecuteSingleFunctions,
		items: INodeExecutionData[],
	): Promise<INodeExecutionData[]> {
		const simplify = this.getNodeParameter('simplify', false) as boolean;
		if (!simplify) return items;

		return items.map((item) => {
			const simplified: IDataObject = {};
			for (const field of fields) {
				if (field in item.json) simplified[field] = item.json[field];
			}
			return { ...item, json: simplified };
		});
	};
}
