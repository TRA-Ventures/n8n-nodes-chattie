import type { INodeProperties } from 'n8n-workflow';
import { getManyFields, idempotencyOptions, offeringLocator } from '../shared/descriptions';
import { addIdempotencyKey } from '../shared/hooks';

const showForOffering = { resource: ['offering'] };
const offeringUrl = '=/api/v1/offerings/{{$parameter.offeringId}}';

const descriptionField: INodeProperties = {
	displayName: 'Description',
	name: 'description',
	type: 'string',
	typeOptions: { rows: 6 },
	default: '',
	description: 'What you sell, for whom and why. The AI uses this text when writing.',
	routing: { send: { type: 'body', property: 'description' } },
};

export const offeringDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: showForOffering },
		options: [
			{
				name: 'Create',
				value: 'create',
				action: 'Create offering',
				description: 'Create a new offering describing what you sell',
				routing: {
					request: { method: 'POST', url: '/api/v1/offerings' },
					send: { preSend: [addIdempotencyKey] },
				},
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get offering',
				description: 'Retrieve the name and description of an offering',
				routing: { request: { method: 'GET', url: offeringUrl } },
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many offerings',
				description: 'Retrieve a list of offerings',
				routing: {
					request: { method: 'GET', url: '/api/v1/offerings' },
					output: { postReceive: [{ type: 'rootProperty', properties: { property: 'data' } }] },
				},
			},
			{
				name: 'Update',
				value: 'update',
				action: 'Update offering',
				description: 'Change only the fields you set on an offering',
				routing: { request: { method: 'PATCH', url: offeringUrl } },
			},
		],
		default: 'getAll',
	},
	{
		...offeringLocator(),
		displayOptions: { show: { ...showForOffering, operation: ['get', 'update'] } },
	},
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'e.g. Outbound as a Service',
		displayOptions: { show: { ...showForOffering, operation: ['create'] } },
		routing: { send: { type: 'body', property: 'name' } },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: { show: { ...showForOffering, operation: ['create'] } },
		default: {},
		options: [descriptionField],
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: { show: { ...showForOffering, operation: ['update'] } },
		default: {},
		options: [
			descriptionField,
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				routing: { send: { type: 'body', property: 'name' } },
			},
		],
	},
	...getManyFields({ ...showForOffering, operation: ['getAll'] }),
	idempotencyOptions({ ...showForOffering, operation: ['create'] }),
];
