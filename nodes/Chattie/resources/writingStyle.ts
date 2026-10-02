import type { INodeProperties } from 'n8n-workflow';
import { languageOptions, linkedInAccountLocator } from '../shared/descriptions';

const showForStyle = { resource: ['writingStyle'] };
const showForSave = { ...showForStyle, operation: ['save'] };

export const writingStyleDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: showForStyle },
		options: [
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many writing styles',
				description:
					'Retrieve the writing voice of each LinkedIn account and its extraction status',
				routing: {
					request: { method: 'GET', url: '/api/v1/writing-styles' },
					output: { postReceive: [{ type: 'rootProperty', properties: { property: 'data' } }] },
				},
			},
			{
				name: 'Set',
				value: 'save',
				action: 'Set writing style',
				description:
					'Define the writing voice of a LinkedIn account from a preset or from text samples',
				routing: { request: { method: 'POST', url: '/api/v1/writing-styles' } },
			},
		],
		default: 'save',
	},
	{
		...linkedInAccountLocator(),
		displayOptions: { show: showForSave },
		routing: { send: { type: 'body', property: 'linkedin_account_id' } },
	},
	{
		displayName: 'Source',
		name: 'source',
		type: 'options',
		noDataExpression: true,
		default: 'preset',
		displayOptions: { show: showForSave },
		options: [
			{ name: 'Preset', value: 'preset', description: 'Use one of the ready-made voices' },
			{
				name: 'Samples',
				value: 'samples',
				description:
					'Extract the voice from texts the person already wrote. If the samples are rejected, an active style is turned off.',
			},
		],
	},
	{
		displayName: 'Preset',
		name: 'preset',
		type: 'options',
		default: 'casual',
		displayOptions: { show: { ...showForSave, source: ['preset'] } },
		options: [
			{ name: 'Casual', value: 'casual' },
			{ name: 'Direct', value: 'direto' },
			{ name: 'Formal', value: 'formal' },
		],
		routing: { send: { type: 'body', property: 'preset' } },
	},
	{
		displayName: 'Samples',
		name: 'samples',
		type: 'string',
		typeOptions: { rows: 4, multipleValues: true, multipleValueButtonText: 'Add Sample' },
		required: true,
		default: [],
		description: 'Posts or messages the person wrote, one per entry',
		displayOptions: { show: { ...showForSave, source: ['samples'] } },
		routing: { send: { type: 'body', property: 'samples' } },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: { show: showForSave },
		default: {},
		options: [
			{
				displayName: 'Banned Expressions',
				name: 'banned',
				type: 'string',
				typeOptions: { multipleValues: true, multipleValueButtonText: 'Add Expression' },
				default: [],
				description: 'Words or phrases the AI must never use',
				routing: { send: { type: 'body', property: 'dos_donts.banned' } },
			},
			{
				displayName: 'Language',
				name: 'language',
				type: 'options',
				default: 'pt-BR',
				description: 'Language of the samples. Only used when Source is Samples.',
				options: languageOptions,
				routing: {
					send: {
						type: 'body',
						property: 'language',
						value: '={{ $parameter.source === "samples" ? $value : undefined }}',
					},
				},
			},
			{
				displayName: 'Notes',
				name: 'notes',
				type: 'string',
				typeOptions: { rows: 3 },
				default: '',
				description: 'Extra guidance about the voice (max 1000 characters)',
				routing: { send: { type: 'body', property: 'dos_donts.notes' } },
			},
			{
				displayName: 'Preferred Expressions',
				name: 'preferred',
				type: 'string',
				typeOptions: { multipleValues: true, multipleValueButtonText: 'Add Expression' },
				default: [],
				description: 'Words or phrases the AI should favor',
				routing: { send: { type: 'body', property: 'dos_donts.preferred' } },
			},
		],
	},
];
