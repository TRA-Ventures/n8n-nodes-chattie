import type { INodeProperties } from 'n8n-workflow';
import {
	campaignLocator,
	getManyFields,
	leadListLocator,
	leadLocator,
	optionalLocator,
	simplifyField,
} from '../shared/descriptions';
import { simplifyOutput } from '../shared/hooks';

export const LEAD_SIMPLIFIED_FIELDS = [
	'id',
	'full_name',
	'linkedin_url',
	'headline',
	'current_title',
	'current_company',
	'location',
	'industry',
	'created_at',
];

const showForLead = { resource: ['lead'] };

export const leadDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: showForLead },
		options: [
			{
				name: 'Get',
				value: 'get',
				action: 'Get lead',
				description: 'Retrieve the profile data of a lead',
				routing: {
					request: { method: 'GET', url: '=/api/v1/leads/{{$parameter.leadId}}' },
					output: { postReceive: [simplifyOutput(LEAD_SIMPLIFIED_FIELDS)] },
				},
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many leads',
				description: 'Retrieve a list of leads in the workspace, with optional filters',
				routing: {
					request: { method: 'GET', url: '/api/v1/leads' },
					output: {
						postReceive: [
							{ type: 'rootProperty', properties: { property: 'data' } },
							simplifyOutput(LEAD_SIMPLIFIED_FIELDS),
						],
					},
				},
			},
		],
		default: 'getAll',
	},
	{
		...leadLocator(),
		displayOptions: { show: { ...showForLead, operation: ['get'] } },
	},
	...getManyFields({ ...showForLead, operation: ['getAll'] }),
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		displayOptions: { show: { ...showForLead, operation: ['getAll'] } },
		default: {},
		description: 'Filters are combined with AND',
		options: [
			{
				...optionalLocator(
					campaignLocator(),
					'Campaign',
					'Only leads that take part in this campaign',
				),
				routing: { send: { type: 'query', property: 'campaign_id' } },
			},
			{
				...optionalLocator(leadListLocator('listId'), 'Lead List', 'Only leads in this list'),
				routing: { send: { type: 'query', property: 'list_id' } },
			},
			{
				displayName: 'Search',
				name: 'search',
				type: 'string',
				default: '',
				placeholder: 'e.g. Nathan Smith',
				description:
					'Partial, case-insensitive match on first name, last name, full name, current company and LinkedIn URL',
				routing: { send: { type: 'query', property: 'search' } },
			},
			{
				displayName: 'Status in Campaign',
				name: 'status',
				type: 'options',
				default: 'replied',
				description:
					'Only leads in this state in some campaign. Combined with Campaign, the state must be in that same campaign.',
				options: [
					{ name: 'Completed', value: 'completed' },
					{ name: 'Connected', value: 'connected' },
					{ name: 'Failed', value: 'failed' },
					{ name: 'Invite Expired', value: 'invite_expired' },
					{ name: 'Invited', value: 'invited' },
					{ name: 'Messaged', value: 'messaged' },
					{ name: 'Paused', value: 'paused' },
					{ name: 'Pending', value: 'pending' },
					{ name: 'Removed From List', value: 'removed_from_list' },
					{ name: 'Replied', value: 'replied' },
					{ name: 'Skipped', value: 'skipped' },
				],
				routing: { send: { type: 'query', property: 'status' } },
			},
		],
	},
	simplifyField({ ...showForLead, operation: ['get', 'getAll'] }),
];
