import type { INodeProperties } from 'n8n-workflow';
import {
	agentLocator,
	campaignLocator,
	getManyFields,
	idempotencyOptions,
	languageOptions,
	leadListLocator,
	linkedInAccountLocator,
	offeringLocator,
	optionalLocator,
	simplifyField,
} from '../shared/descriptions';
import { addIdempotencyKey, simplifyOutput } from '../shared/hooks';

const CAMPAIGN_SIMPLIFIED_FIELDS = [
	'id',
	'name',
	'status',
	'mode',
	'goal',
	'language',
	'lead_list_id',
	'linkedin_account_id',
	'created_at',
	'updated_at',
];

const showForCampaign = { resource: ['campaign'] };

const campaignUrl = '=/api/v1/campaigns/{{$parameter.campaignId}}';

const modeOptions = [
	{
		name: 'Autopilot',
		value: 'autopilot',
		description: 'The AI writes and sends messages on its own',
	},
	{
		name: 'Copilot',
		value: 'copilot',
		description: 'The AI drafts messages and a person approves them',
	},
	{ name: 'Semi-Pilot', value: 'semi_pilot' },
];

/** Fields shared by Create (Additional Fields) and Update (Update Fields). */
const campaignOptionalFields: INodeProperties[] = [
	{
		...optionalLocator(agentLocator(), 'Agent', 'Agent whose instructions the AI uses to write'),
		routing: { send: { type: 'body', property: 'agent_id' } },
	},
	{
		displayName: 'Exclude Contacted Leads',
		name: 'excludeContactedLeads',
		type: 'boolean',
		default: false,
		description: 'Whether to skip leads that were already contacted by another campaign',
		routing: { send: { type: 'body', property: 'exclude_contacted_leads' } },
	},
	{
		displayName: 'Goal',
		name: 'goal',
		type: 'string',
		default: '',
		placeholder: 'e.g. Book a 20-minute demo call',
		description: 'What the campaign is trying to achieve with each lead',
		routing: { send: { type: 'body', property: 'goal' } },
	},
	{
		...optionalLocator(leadListLocator(), 'Lead List', 'Lead list that feeds the campaign queue'),
		routing: { send: { type: 'body', property: 'lead_list_id' } },
	},
	{
		...optionalLocator(
			linkedInAccountLocator(),
			'LinkedIn Account',
			'LinkedIn account (sender) that runs the campaign',
		),
		routing: { send: { type: 'body', property: 'linkedin_account_id' } },
	},
	{
		...optionalLocator(offeringLocator(), 'Offering', 'What the campaign is selling'),
		routing: { send: { type: 'body', property: 'offering_id' } },
	},
	{
		displayName: 'Qualification Filter',
		name: 'qualificationFilter',
		type: 'options',
		default: 'all',
		description: 'Which leads, by ICP qualification, enter the campaign',
		options: [
			{ name: 'All Leads', value: 'all' },
			{ name: 'Qualified Only', value: 'qualified' },
			{ name: 'Qualified or Uncertain', value: 'qualified_uncertain' },
		],
		routing: { send: { type: 'body', property: 'qualification_filter' } },
	},
	{
		displayName: 'Rotation Account IDs',
		name: 'rotationAccountIds',
		type: 'string',
		typeOptions: { multipleValues: true, multipleValueButtonText: 'Add Account ID' },
		default: [],
		description: 'IDs of extra LinkedIn accounts the campaign rotates between',
		routing: { send: { type: 'body', property: 'rotation_account_ids' } },
	},
	{
		displayName: 'Scheduling Link ID',
		name: 'schedulingLinkId',
		type: 'string',
		default: '',
		description: 'ID of the scheduling link the AI offers to book meetings',
		routing: { send: { type: 'body', property: 'scheduling_link_id' } },
	},
];

export const campaignDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: showForCampaign },
		options: [
			{
				name: 'Activate',
				value: 'activate',
				action: 'Activate campaign',
				description:
					'Start prospecting: invitations and messages go out and consume credits and LinkedIn quota',
				routing: { request: { method: 'POST', url: `${campaignUrl}/activate` } },
			},
			{
				name: 'Archive',
				value: 'archive',
				action: 'Archive campaign',
				description: 'Take the campaign out of operation (reversible with Unarchive)',
				routing: { request: { method: 'POST', url: `${campaignUrl}/archive` } },
			},
			{
				name: 'Create',
				value: 'create',
				action: 'Create campaign',
				description: 'Create a new campaign as a draft',
				routing: {
					request: { method: 'POST', url: '/api/v1/campaigns' },
					send: { preSend: [addIdempotencyKey] },
				},
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get campaign',
				description: 'Retrieve a campaign',
				routing: {
					request: { method: 'GET', url: campaignUrl },
					output: { postReceive: [simplifyOutput(CAMPAIGN_SIMPLIFIED_FIELDS)] },
				},
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many campaigns',
				description: 'Retrieve a list of campaigns, most recent first',
				routing: {
					request: { method: 'GET', url: '/api/v1/campaigns' },
					output: {
						postReceive: [
							{ type: 'rootProperty', properties: { property: 'data' } },
							simplifyOutput(CAMPAIGN_SIMPLIFIED_FIELDS),
						],
					},
				},
			},
			{
				name: 'Pause',
				value: 'pause',
				action: 'Pause campaign',
				description: 'Stop prospecting and cancel messages already queued',
				routing: { request: { method: 'DELETE', url: `${campaignUrl}/activate` } },
			},
			{
				name: 'Unarchive',
				value: 'unarchive',
				action: 'Unarchive campaign',
				description: 'Bring an archived campaign back in the status it had before',
				routing: { request: { method: 'DELETE', url: `${campaignUrl}/archive` } },
			},
			{
				name: 'Update',
				value: 'update',
				action: 'Update campaign',
				description: 'Change only the fields you set on a campaign',
				routing: { request: { method: 'PATCH', url: campaignUrl } },
			},
		],
		default: 'getAll',
	},
	{
		...campaignLocator(),
		displayOptions: {
			show: {
				...showForCampaign,
				operation: ['activate', 'archive', 'get', 'pause', 'unarchive', 'update'],
			},
		},
	},

	// Create
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'e.g. Q4 outbound – SaaS founders',
		description: 'Name of the campaign (max 100 characters)',
		displayOptions: { show: { ...showForCampaign, operation: ['create'] } },
		routing: { send: { type: 'body', property: 'name' } },
	},
	{
		displayName: 'Mode',
		name: 'mode',
		type: 'options',
		default: 'autopilot',
		description: 'How much the AI does on its own',
		options: modeOptions,
		displayOptions: { show: { ...showForCampaign, operation: ['create'] } },
		routing: { send: { type: 'body', property: 'mode' } },
	},
	{
		displayName: 'Language',
		name: 'language',
		type: 'options',
		default: 'pt-BR',
		description: 'Language the AI writes in',
		options: languageOptions,
		displayOptions: { show: { ...showForCampaign, operation: ['create'] } },
		routing: { send: { type: 'body', property: 'language' } },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: { show: { ...showForCampaign, operation: ['create'] } },
		default: {},
		options: campaignOptionalFields,
	},

	// Update
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: { show: { ...showForCampaign, operation: ['update'] } },
		default: {},
		options: [
			...campaignOptionalFields,
			{
				displayName: 'Language',
				name: 'language',
				type: 'options',
				default: 'pt-BR',
				options: languageOptions,
				routing: { send: { type: 'body', property: 'language' } },
			},
			{
				displayName: 'Mode',
				name: 'mode',
				type: 'options',
				default: 'autopilot',
				options: modeOptions,
				routing: { send: { type: 'body', property: 'mode' } },
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				routing: { send: { type: 'body', property: 'name' } },
			},
		],
	},

	// Get Many
	...getManyFields({ ...showForCampaign, operation: ['getAll'] }),
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		displayOptions: { show: { ...showForCampaign, operation: ['getAll'] } },
		default: {},
		options: [
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				default: 'active',
				options: [
					{ name: 'Active', value: 'active' },
					{ name: 'Draft', value: 'draft' },
					{ name: 'Paused', value: 'paused' },
				],
				routing: { send: { type: 'query', property: 'status' } },
			},
		],
	},
	simplifyField({ ...showForCampaign, operation: ['get', 'getAll'] }),
	idempotencyOptions({ ...showForCampaign, operation: ['create'] }),
];
