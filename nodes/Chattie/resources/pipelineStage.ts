import type { INodeProperties, INodePropertyOptions } from 'n8n-workflow';
import { pipelineStageLocator } from '../shared/descriptions';

const showForStage = { resource: ['pipelineStage'] };

const stageTypeOptions: INodePropertyOptions[] = [
	{ name: 'Neutral', value: 'neutral' },
	{
		name: 'Won',
		value: 'won',
		description: 'Terminal column: moving a conversation here pauses its sequence',
	},
	{
		name: 'Lost',
		value: 'lost',
		description: 'Terminal column: moving a conversation here pauses its sequence',
	},
];

export const pipelineStageDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: showForStage },
		options: [
			{
				name: 'Create',
				value: 'create',
				action: 'Create pipeline stage',
				description: 'Create a new column in the pipeline board (max 12 per workspace)',
				routing: { request: { method: 'POST', url: '/api/v1/pipeline/stages' } },
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many pipeline stages',
				description: 'Retrieve the pipeline columns in board order',
				routing: {
					request: { method: 'GET', url: '/api/v1/pipeline/stages' },
					output: { postReceive: [{ type: 'rootProperty', properties: { property: 'data' } }] },
				},
			},
			{
				name: 'Update',
				value: 'update',
				action: 'Update pipeline stage',
				description: 'Change the name, color or type of a pipeline column',
				routing: {
					request: { method: 'PATCH', url: '=/api/v1/pipeline/stages/{{$parameter.stageId}}' },
				},
			},
		],
		default: 'getAll',
	},

	// Create
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'e.g. Meeting Booked',
		displayOptions: { show: { ...showForStage, operation: ['create'] } },
		routing: { send: { type: 'body', property: 'name' } },
	},
	{
		displayName: 'Color',
		name: 'color',
		type: 'color',
		required: true,
		default: '#4f46e5',
		displayOptions: { show: { ...showForStage, operation: ['create'] } },
		routing: { send: { type: 'body', property: 'color' } },
	},
	{
		displayName: 'Type',
		name: 'type',
		type: 'options',
		default: 'neutral',
		options: stageTypeOptions,
		displayOptions: { show: { ...showForStage, operation: ['create'] } },
		routing: { send: { type: 'body', property: 'type' } },
	},

	// Update
	{
		...pipelineStageLocator(),
		displayOptions: { show: { ...showForStage, operation: ['update'] } },
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: { show: { ...showForStage, operation: ['update'] } },
		default: {},
		options: [
			{
				displayName: 'Color',
				name: 'color',
				type: 'color',
				default: '#4f46e5',
				routing: { send: { type: 'body', property: 'color' } },
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				routing: { send: { type: 'body', property: 'name' } },
			},
			{
				displayName: 'Type',
				name: 'type',
				type: 'options',
				default: 'neutral',
				options: stageTypeOptions,
				routing: { send: { type: 'body', property: 'type' } },
			},
		],
	},
];
