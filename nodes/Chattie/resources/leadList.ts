import type { INodeProperties } from 'n8n-workflow';
import {
	getManyFields,
	idempotencyOptions,
	leadListLocator,
	simplifyField,
} from '../shared/descriptions';
import { addIdempotencyKey, simplifyOutput } from '../shared/hooks';
import { LEAD_SIMPLIFIED_FIELDS } from './lead';

const showForLeadList = { resource: ['leadList'] };
const showForImport = { ...showForLeadList, operation: ['importLeads'] };

export const leadListDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: showForLeadList },
		options: [
			{
				name: 'Create',
				value: 'create',
				action: 'Create lead list',
				description: 'Create a new lead list',
				routing: {
					request: { method: 'POST', url: '/api/v1/lead-lists' },
					send: { preSend: [addIdempotencyKey] },
				},
			},
			{
				name: 'Get Leads',
				value: 'getLeads',
				action: 'Get leads in lead list',
				description: 'List all leads in a lead list',
				routing: {
					request: { method: 'GET', url: '=/api/v1/lead-lists/{{$parameter.leadListId}}/leads' },
					output: {
						postReceive: [
							{ type: 'rootProperty', properties: { property: 'data' } },
							simplifyOutput(LEAD_SIMPLIFIED_FIELDS),
						],
					},
				},
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many lead lists',
				description: 'Retrieve a list of lead lists',
				routing: {
					request: { method: 'GET', url: '/api/v1/lead-lists' },
					output: { postReceive: [{ type: 'rootProperty', properties: { property: 'data' } }] },
				},
			},
			{
				name: 'Import Leads',
				value: 'importLeads',
				action: 'Import leads into lead list',
				description:
					'Add leads to a lead list. If the list feeds a campaign, new leads join its queue.',
				routing: {
					request: {
						method: 'POST',
						url: '=/api/v1/lead-lists/{{$parameter.leadListId}}/leads',
					},
					send: { preSend: [addIdempotencyKey] },
				},
			},
		],
		default: 'importLeads',
	},

	// Create
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'e.g. SaaS founders – São Paulo',
		description: 'Name of the lead list (max 200 characters)',
		displayOptions: { show: { ...showForLeadList, operation: ['create'] } },
		routing: { send: { type: 'body', property: 'name' } },
	},

	// Get Leads / Import Leads
	{
		...leadListLocator(),
		displayOptions: { show: { ...showForLeadList, operation: ['getLeads', 'importLeads'] } },
	},

	// Import Leads
	{
		displayName: 'Input Mode',
		name: 'inputMode',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: showForImport },
		options: [
			{
				name: 'One Lead per Item',
				value: 'fields',
				description: 'Map the fields of one lead from each input item',
			},
			{
				name: 'JSON Array',
				value: 'json',
				description: 'Send up to 200 leads at once from a JSON array',
			},
		],
		default: 'fields',
	},
	{
		displayName: 'LinkedIn URL',
		name: 'linkedinUrl',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'e.g. https://www.linkedin.com/in/nathan-smith',
		displayOptions: { show: { ...showForImport, inputMode: ['fields'] } },
		routing: { send: { type: 'body', property: 'leads[0].linkedin_url' } },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: { show: { ...showForImport, inputMode: ['fields'] } },
		default: {},
		options: [
			{
				displayName: 'First Name',
				name: 'firstName',
				type: 'string',
				default: '',
				placeholder: 'e.g. Nathan',
				routing: { send: { type: 'body', property: 'leads[0].first_name' } },
			},
			{
				displayName: 'Last Name',
				name: 'lastName',
				type: 'string',
				default: '',
				placeholder: 'e.g. Smith',
				routing: { send: { type: 'body', property: 'leads[0].last_name' } },
			},
			{
				displayName: 'Notes',
				name: 'notes',
				type: 'string',
				typeOptions: { rows: 3 },
				default: '',
				description: 'Free-text context about the lead (max 5000 characters)',
				routing: { send: { type: 'body', property: 'leads[0].notes' } },
			},
		],
	},
	{
		displayName: 'Leads (JSON)',
		name: 'leadsJson',
		type: 'json',
		required: true,
		default:
			'[\n  {\n    "linkedin_url": "https://www.linkedin.com/in/nathan-smith",\n    "first_name": "Nathan",\n    "last_name": "Smith"\n  }\n]',
		description:
			'Array of up to 200 leads. Each lead needs <code>linkedin_url</code> and may have <code>first_name</code>, <code>last_name</code> and <code>notes</code>.',
		displayOptions: { show: { ...showForImport, inputMode: ['json'] } },
		routing: {
			send: {
				type: 'body',
				property: 'leads',
				value: '={{ typeof $value === "string" ? JSON.parse($value) : $value }}',
			},
		},
	},

	...getManyFields({ ...showForLeadList, operation: ['getAll', 'getLeads'] }),
	simplifyField({ ...showForLeadList, operation: ['getLeads'] }),
	idempotencyOptions({ ...showForLeadList, operation: ['create', 'importLeads'] }),
];
