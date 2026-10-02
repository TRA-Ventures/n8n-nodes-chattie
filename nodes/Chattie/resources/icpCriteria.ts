import type { INodeProperties } from 'n8n-workflow';
import { getManyFields, idempotencyOptions } from '../shared/descriptions';
import { addIdempotencyKey } from '../shared/hooks';

const showForIcp = { resource: ['icpCriteria'] };
const showForCreate = { ...showForIcp, operation: ['create'] };

export const icpCriteriaDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: showForIcp },
		options: [
			{
				name: 'Create',
				value: 'create',
				action: 'Create ICP filter',
				description: 'Create a free-text ICP filter that AI checks when leads are imported',
				routing: {
					request: { method: 'POST', url: '/api/v1/icp-criteria' },
					send: { preSend: [addIdempotencyKey] },
				},
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many ICP filters',
				description: 'Retrieve a list of ICP filters used to qualify leads',
				routing: {
					request: { method: 'GET', url: '/api/v1/icp-criteria' },
					output: { postReceive: [{ type: 'rootProperty', properties: { property: 'data' } }] },
				},
			},
		],
		default: 'getAll',
	},
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'e.g. B2B SaaS decision makers',
		displayOptions: { show: showForCreate },
		routing: { send: { type: 'body', property: 'name' } },
	},
	{
		displayName: 'Instructions',
		name: 'instructions',
		type: 'string',
		typeOptions: { rows: 6 },
		required: true,
		default: '',
		placeholder: 'e.g. Founders or heads of sales at B2B SaaS companies with 10–200 employees',
		description: 'Who qualifies, in plain language (max 5000 characters)',
		displayOptions: { show: showForCreate },
		routing: { send: { type: 'body', property: 'instructions' } },
	},
	...getManyFields({ ...showForIcp, operation: ['getAll'] }),
	idempotencyOptions(showForCreate),
];
