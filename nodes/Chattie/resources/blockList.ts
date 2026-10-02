import type { INodeProperties } from 'n8n-workflow';
import { getManyFields } from '../shared/descriptions';

const showForBlockList = { resource: ['blockList'] };

export const blockListDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: showForBlockList },
		options: [
			{
				name: 'Block',
				value: 'block',
				action: 'Block person',
				description:
					'Add a LinkedIn profile to the do-not-contact list. Ongoing campaigns and conversations with them stop right away.',
				routing: { request: { method: 'POST', url: '/api/v1/block-list/entries' } },
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many blocked people',
				description: 'Retrieve the do-not-contact list of the workspace',
				routing: {
					request: { method: 'GET', url: '/api/v1/block-list/entries' },
					output: { postReceive: [{ type: 'rootProperty', properties: { property: 'data' } }] },
				},
			},
			{
				name: 'Unblock',
				value: 'unblock',
				action: 'Unblock person',
				description:
					'Remove a LinkedIn profile from the do-not-contact list and resume what was frozen',
				routing: { request: { method: 'POST', url: '/api/v1/block-list/entries/unblock' } },
			},
		],
		default: 'block',
	},
	{
		displayName: 'LinkedIn URL',
		name: 'linkedinUrl',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'e.g. https://www.linkedin.com/in/nathan-smith',
		displayOptions: { show: { ...showForBlockList, operation: ['block', 'unblock'] } },
		routing: { send: { type: 'body', property: 'linkedin_url' } },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: { show: { ...showForBlockList, operation: ['block'] } },
		default: {},
		options: [
			{
				displayName: 'Tags',
				name: 'tags',
				type: 'string',
				typeOptions: { multipleValues: true, multipleValueButtonText: 'Add Tag' },
				default: [],
				placeholder: 'e.g. competitor',
				routing: { send: { type: 'body', property: 'tags' } },
			},
		],
	},
	...getManyFields({ ...showForBlockList, operation: ['getAll'] }),
];
