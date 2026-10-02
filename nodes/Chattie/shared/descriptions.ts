import type {
	IDataObject,
	IDisplayOptions,
	INodeProperties,
	INodePropertyOptions,
} from 'n8n-workflow';

type Show = NonNullable<IDisplayOptions['show']>;

export const languageOptions: INodePropertyOptions[] = [
	{ name: 'English', value: 'en' },
	{ name: 'French (France)', value: 'fr-FR' },
	{ name: 'Portuguese (Brazil)', value: 'pt-BR' },
	{ name: 'Portuguese (Portugal)', value: 'pt-PT' },
	{ name: 'Spanish', value: 'es' },
];

/** A resource locator that lets the user pick from a searchable list or paste an ID. */
function resourceLocator(
	name: string,
	displayName: string,
	searchListMethod: string,
	searchable = true,
): Omit<INodeProperties, 'displayOptions'> {
	return {
		displayName,
		name,
		type: 'resourceLocator',
		default: { mode: 'list', value: '' },
		required: true,
		modes: [
			{
				displayName: 'From List',
				name: 'list',
				type: 'list',
				placeholder: `Select a ${displayName.toLowerCase()}...`,
				typeOptions: {
					searchListMethod,
					searchable,
				},
			},
			{
				displayName: 'By ID',
				name: 'id',
				type: 'string',
				placeholder: 'e.g. 3f1c2a9e-1b2c-4d5e-8f90-1a2b3c4d5e6f',
			},
		],
	};
}

export const agentLocator = (name = 'agentId') => resourceLocator(name, 'Agent', 'getAgents');
export const campaignLocator = (name = 'campaignId') =>
	resourceLocator(name, 'Campaign', 'getCampaigns');
export const leadListLocator = (name = 'leadListId') =>
	resourceLocator(name, 'Lead List', 'getLeadLists');
export const leadLocator = (name = 'leadId') => resourceLocator(name, 'Lead', 'getLeads');
export const linkedInAccountLocator = (name = 'linkedInAccountId') =>
	resourceLocator(name, 'LinkedIn Account', 'getLinkedInAccounts');
export const offeringLocator = (name = 'offeringId') =>
	resourceLocator(name, 'Offering', 'getOfferings');
export const pipelineStageLocator = (name = 'stageId') =>
	resourceLocator(name, 'Pipeline Stage', 'getPipelineStages');

/** Same locator, but optional and meant to live inside a collection (no `required`). */
export function optionalLocator(
	locator: Omit<INodeProperties, 'displayOptions'>,
	displayName: string,
	description: string,
): INodeProperties {
	const optional: INodeProperties = { ...locator, displayName, description };
	delete optional.required;
	return optional;
}

/**
 * "Return All" + "Limit" for Chattie's cursor-paginated list endpoints
 * (`limit`, `starting_after`, `has_more`, `next_cursor`).
 */
export function getManyFields(show: Show, maxLimit = 100): INodeProperties[] {
	return [
		{
			displayName: 'Return All',
			name: 'returnAll',
			type: 'boolean',
			displayOptions: { show },
			default: false,
			description: 'Whether to return all results or only up to a given limit',
			routing: {
				send: {
					paginate: '={{ $value }}',
					type: 'query',
					property: 'limit',
					value: String(maxLimit),
				},
				operations: {
					pagination: {
						type: 'generic',
						properties: {
							continue: '={{ $response.body?.has_more === true }}',
							request: {
								// The generic paginator replaces `qs` wholesale, so merge the cursor into the
								// original query (limit + filters). The expression resolves to an object at runtime.
								qs: '={{ Object.assign({}, $request.qs, $response.body?.next_cursor ? { starting_after: $response.body.next_cursor } : {}) }}' as unknown as IDataObject,
							},
						},
					},
				},
			},
		},
		{
			displayName: 'Limit',
			name: 'limit',
			type: 'number',
			displayOptions: { show: { ...show, returnAll: [false] } },
			typeOptions: { minValue: 1, maxValue: maxLimit },
			default: 50,
			description: 'Max number of results to return',
			routing: {
				send: { type: 'query', property: 'limit' },
				output: { maxResults: '={{ $value }}' },
			},
		},
	];
}

export function simplifyField(show: Show): INodeProperties {
	return {
		displayName: 'Simplify',
		name: 'simplify',
		type: 'boolean',
		displayOptions: { show },
		default: true,
		description: 'Whether to return a simplified version of the response instead of the raw data',
	};
}

/** Options collection holding the Idempotency-Key override, for endpoints that require it. */
export function idempotencyOptions(show: Show): INodeProperties {
	return {
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		displayOptions: { show },
		default: {},
		options: [
			{
				displayName: 'Idempotency Key',
				name: 'idempotencyKey',
				type: 'string',
				default: '',
				description:
					'Unique ID for this operation. Repeating a request with the same key returns the original result instead of running it again. Leave empty to generate one automatically.',
			},
		],
	};
}
