import type { INodeProperties } from 'n8n-workflow';
import { idempotencyOptions, leadLocator, linkedInAccountLocator } from '../shared/descriptions';
import { addIdempotencyKey } from '../shared/hooks';

const showForSend = { resource: ['message'], operation: ['send'] };

export const messageDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['message'] } },
		options: [
			{
				name: 'Send',
				value: 'send',
				action: 'Send message to lead',
				description:
					'Message a lead outside of a campaign. If not connected yet, an invitation goes out and the message waits for acceptance.',
				routing: {
					request: { method: 'POST', url: '/api/v1/messages' },
					send: { preSend: [addIdempotencyKey] },
				},
			},
		],
		default: 'send',
	},
	{
		...leadLocator(),
		displayOptions: { show: showForSend },
		routing: { send: { type: 'body', property: 'lead_id' } },
	},
	{
		...linkedInAccountLocator(),
		description: 'LinkedIn account (sender) that sends the message',
		displayOptions: { show: showForSend },
		routing: { send: { type: 'body', property: 'linkedin_account_id' } },
	},
	{
		displayName: 'Content',
		name: 'content',
		type: 'string',
		typeOptions: { rows: 4 },
		required: true,
		default: '',
		description:
			'Message text (max 8000 characters). Each send consumes one credit and one action of the daily LinkedIn quota.',
		displayOptions: { show: showForSend },
		routing: { send: { type: 'body', property: 'content' } },
	},
	idempotencyOptions(showForSend),
];
