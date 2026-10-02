import type { INodeProperties } from 'n8n-workflow';
import { campaignLocator, linkedInAccountLocator, optionalLocator } from '../shared/descriptions';

const showForStats = { resource: ['analytics'], operation: ['getStats'] };

/** The API wants plain `YYYY-MM-DD`; n8n date pickers produce ISO date-times. */
const toIsoDate = '={{ String($value).slice(0, 10) }}';

export const analyticsDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['analytics'] } },
		options: [
			{
				name: 'Get Stats',
				value: 'getStats',
				action: 'Get analytics stats',
				description:
					'Retrieve totals for a period: invites, acceptances, replies, goals, meetings and cost',
				routing: { request: { method: 'GET', url: '/api/v1/analytics/stats' } },
			},
		],
		default: 'getStats',
	},
	{
		displayName: 'From',
		name: 'from',
		type: 'dateTime',
		required: true,
		default: '',
		description: 'Start of the period (inclusive). Only the date part is used.',
		displayOptions: { show: showForStats },
		routing: { send: { type: 'query', property: 'from', value: toIsoDate } },
	},
	{
		displayName: 'To',
		name: 'to',
		type: 'dateTime',
		required: true,
		default: '',
		description: 'End of the period (exclusive), must be after From. Only the date part is used.',
		displayOptions: { show: showForStats },
		routing: { send: { type: 'query', property: 'to', value: toIsoDate } },
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		displayOptions: { show: showForStats },
		default: {},
		description:
			'Filtering by campaign or LinkedIn account leaves credits and LLM cost out of the totals',
		options: [
			{
				...optionalLocator(campaignLocator(), 'Campaign', 'Only count this campaign'),
				routing: { send: { type: 'query', property: 'campaign_id' } },
			},
			{
				...optionalLocator(
					linkedInAccountLocator(),
					'LinkedIn Account',
					'Only count this LinkedIn account (sender)',
				),
				routing: { send: { type: 'query', property: 'linkedin_account_id' } },
			},
		],
	},
];
