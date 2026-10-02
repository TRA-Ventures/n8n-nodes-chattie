import type { INodeProperties } from 'n8n-workflow';
import { getManyFields, linkedInAccountLocator } from '../shared/descriptions';

const showForAccount = { resource: ['linkedInAccount'] };

export const linkedInAccountDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: showForAccount },
		options: [
			{
				name: 'Get Connections',
				value: 'getConnections',
				action: 'Get account connections',
				description:
					'List the current 1st-degree connections of a LinkedIn account. Uses LinkedIn rate limits, so page slowly.',
				routing: {
					request: {
						method: 'GET',
						url: '=/api/v1/linkedin-accounts/{{$parameter.linkedInAccountId}}/connections',
					},
					output: { postReceive: [{ type: 'rootProperty', properties: { property: 'data' } }] },
				},
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many accounts',
				description: 'Retrieve the LinkedIn accounts (senders) connected to the workspace',
				routing: {
					request: { method: 'GET', url: '/api/v1/linkedin-accounts' },
					output: { postReceive: [{ type: 'rootProperty', properties: { property: 'data' } }] },
				},
			},
		],
		default: 'getAll',
	},
	{
		...linkedInAccountLocator(),
		displayOptions: { show: { ...showForAccount, operation: ['getConnections'] } },
	},
	...getManyFields({ ...showForAccount, operation: ['getAll', 'getConnections'] }),
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		displayOptions: { show: { ...showForAccount, operation: ['getConnections'] } },
		default: {},
		options: [
			{
				displayName: 'Name',
				name: 'q',
				type: 'string',
				default: '',
				placeholder: 'e.g. Nathan',
				description: 'Filter connections by name (applied on LinkedIn)',
				routing: { send: { type: 'query', property: 'q' } },
			},
		],
	},
];
