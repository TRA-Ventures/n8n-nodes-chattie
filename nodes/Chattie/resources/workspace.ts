import type { INodeProperties } from 'n8n-workflow';

export const workspaceDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['workspace'] } },
		options: [
			{
				name: 'Get',
				value: 'get',
				action: 'Get workspace',
				description: 'Retrieve the workspace this API key belongs to and its effective scopes',
				routing: { request: { method: 'GET', url: '/api/v1/me' } },
			},
			{
				name: 'Get Credits',
				value: 'getCredits',
				action: 'Get workspace credits',
				description: 'Retrieve the credit balance of the workspace (one credit = one AI message)',
				routing: { request: { method: 'GET', url: '/api/v1/credits' } },
			},
			{
				name: 'Get Members',
				value: 'getMembers',
				action: 'Get workspace members',
				description: 'List the people with access to the workspace and their roles',
				routing: {
					request: { method: 'GET', url: '/api/v1/users' },
					output: { postReceive: [{ type: 'rootProperty', properties: { property: 'data' } }] },
				},
			},
		],
		default: 'get',
	},
];
