import type { INodeProperties } from 'n8n-workflow';
import { agentLocator, getManyFields, idempotencyOptions } from '../shared/descriptions';
import { addIdempotencyKey } from '../shared/hooks';

const showForAgent = { resource: ['agent'] };
const agentUrl = '=/api/v1/agents/{{$parameter.agentId}}';

const prompts = {
	firstMessagePrompt: {
		displayName: 'First Message Prompt',
		property: 'first_message_prompt',
		description: 'Instructions the AI follows to write the first message',
	},
	followupPrompt: {
		displayName: 'Follow-Up Prompt',
		property: 'followup_prompt',
		description: 'Instructions the AI follows to write follow-ups when the lead does not reply',
	},
	conversationPrompt: {
		displayName: 'Conversation Prompt',
		property: 'conversation_prompt',
		description: 'Instructions the AI follows to answer once the lead replies',
	},
};

function promptField(key: keyof typeof prompts, required: boolean): INodeProperties {
	const prompt = prompts[key];
	return {
		displayName: prompt.displayName,
		name: key,
		type: 'string',
		typeOptions: { rows: 6 },
		required,
		default: '',
		description: prompt.description,
		routing: { send: { type: 'body', property: prompt.property } },
	};
}

const connectionRequestPrompt: INodeProperties = {
	displayName: 'Connection Request Prompt',
	name: 'connectionRequestPrompt',
	type: 'string',
	typeOptions: { rows: 4 },
	default: '',
	description:
		'Instructions the AI follows to write the note sent with connection requests (max 4000 characters)',
	routing: { send: { type: 'body', property: 'connection_request_prompt' } },
};

const showForCreate = { ...showForAgent, operation: ['create'] };

export const agentDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: showForAgent },
		options: [
			{
				name: 'Create',
				value: 'create',
				action: 'Create agent',
				description:
					'Create a new agent: the instructions the AI uses to write. Platform safety rules always apply first.',
				routing: {
					request: { method: 'POST', url: '/api/v1/agents' },
					send: { preSend: [addIdempotencyKey] },
				},
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get agent',
				description: 'Retrieve an agent and its prompts',
				routing: { request: { method: 'GET', url: agentUrl } },
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many agents',
				description: 'Retrieve a list of agents',
				routing: {
					request: { method: 'GET', url: '/api/v1/agents' },
					output: { postReceive: [{ type: 'rootProperty', properties: { property: 'data' } }] },
				},
			},
			{
				name: 'Update',
				value: 'update',
				action: 'Update agent',
				description: 'Change only the fields you set on an agent',
				routing: { request: { method: 'PATCH', url: agentUrl } },
			},
		],
		default: 'getAll',
	},
	{
		...agentLocator(),
		displayOptions: { show: { ...showForAgent, operation: ['get', 'update'] } },
	},

	// Create
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'e.g. Consultative SDR',
		displayOptions: { show: showForCreate },
		routing: { send: { type: 'body', property: 'name' } },
	},
	{ ...promptField('firstMessagePrompt', true), displayOptions: { show: showForCreate } },
	{ ...promptField('followupPrompt', true), displayOptions: { show: showForCreate } },
	{ ...promptField('conversationPrompt', true), displayOptions: { show: showForCreate } },
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: { show: showForCreate },
		default: {},
		options: [connectionRequestPrompt],
	},

	// Update
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: { show: { ...showForAgent, operation: ['update'] } },
		default: {},
		options: [
			connectionRequestPrompt,
			promptField('conversationPrompt', false),
			promptField('firstMessagePrompt', false),
			promptField('followupPrompt', false),
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				routing: { send: { type: 'body', property: 'name' } },
			},
		],
	},

	...getManyFields({ ...showForAgent, operation: ['getAll'] }),
	idempotencyOptions(showForCreate),
];
