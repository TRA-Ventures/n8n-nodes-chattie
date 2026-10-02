import type { INodeProperties } from 'n8n-workflow';
import {
	campaignLocator,
	getManyFields,
	leadLocator,
	optionalLocator,
} from '../shared/descriptions';

const showForActivity = { resource: ['activity'] };

export const activityDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: showForActivity },
		options: [
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many activities',
				description:
					'Retrieve the event log (invites, replies, goals…) that Chattie metrics are built from',
				routing: {
					request: { method: 'GET', url: '/api/v1/activities' },
					output: { postReceive: [{ type: 'rootProperty', properties: { property: 'data' } }] },
				},
			},
		],
		default: 'getAll',
	},
	...getManyFields({ ...showForActivity, operation: ['getAll'] }),
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		displayOptions: { show: { ...showForActivity, operation: ['getAll'] } },
		default: {},
		options: [
			{
				...optionalLocator(campaignLocator(), 'Campaign', 'Only events of this campaign'),
				routing: { send: { type: 'query', property: 'campaign_id' } },
			},
			{
				displayName: 'Event Type',
				name: 'eventType',
				type: 'string',
				default: '',
				placeholder: 'e.g. reply_received',
				description:
					'Event type, such as <code>reply_received</code> or <code>goal_achieved</code>',
				routing: { send: { type: 'query', property: 'event_type' } },
			},
			{
				...optionalLocator(leadLocator(), 'Lead', 'Only events of this lead'),
				routing: { send: { type: 'query', property: 'lead_id' } },
			},
		],
	},
];
