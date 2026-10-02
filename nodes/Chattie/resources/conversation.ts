import type { INodeProperties } from 'n8n-workflow';
import {
	campaignLocator,
	getManyFields,
	leadLocator,
	optionalLocator,
} from '../shared/descriptions';

const showForConversation = { resource: ['conversation'] };

export const conversationDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: showForConversation },
		options: [
			{
				name: 'Get',
				value: 'get',
				action: 'Get conversation',
				description: 'Retrieve the state of a conversation, its lead and LinkedIn account',
				routing: {
					request: {
						method: 'GET',
						url: '=/api/v1/conversations/{{$parameter.conversationId}}',
					},
				},
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many conversations',
				description: 'Retrieve a list of conversations, most recent first',
				routing: {
					request: { method: 'GET', url: '/api/v1/conversations' },
					output: { postReceive: [{ type: 'rootProperty', properties: { property: 'data' } }] },
				},
			},
			{
				name: 'Get Messages',
				value: 'getMessages',
				action: 'Get messages in conversation',
				description: 'List the message history of a conversation, most recent first',
				routing: {
					request: {
						method: 'GET',
						url: '=/api/v1/conversations/{{$parameter.conversationId}}/messages',
					},
					output: { postReceive: [{ type: 'rootProperty', properties: { property: 'data' } }] },
				},
			},
		],
		default: 'getAll',
	},
	{
		displayName: 'Conversation ID',
		name: 'conversationId',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'e.g. 3f1c2a9e-1b2c-4d5e-8f90-1a2b3c4d5e6f',
		displayOptions: { show: { ...showForConversation, operation: ['get', 'getMessages'] } },
	},
	...getManyFields({ ...showForConversation, operation: ['getAll', 'getMessages'] }),
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		displayOptions: { show: { ...showForConversation, operation: ['getAll'] } },
		default: {},
		options: [
			{
				...optionalLocator(campaignLocator(), 'Campaign', 'Only conversations of this campaign'),
				routing: { send: { type: 'query', property: 'campaign_id' } },
			},
			{
				...optionalLocator(leadLocator(), 'Lead', 'Only conversations with this lead'),
				routing: { send: { type: 'query', property: 'lead_id' } },
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'string',
				default: '',
				placeholder: 'e.g. human_takeover',
				description:
					'Conversation status, such as <code>active</code>, <code>paused</code> or <code>human_takeover</code>',
				routing: { send: { type: 'query', property: 'status' } },
			},
		],
	},
];
