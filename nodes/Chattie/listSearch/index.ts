import type {
	IDataObject,
	ILoadOptionsFunctions,
	INodeListSearchItems,
	INodeListSearchResult,
} from 'n8n-workflow';
import { chattieApiRequest, type ChattieListResponse } from '../shared/transport';

type ListItem = IDataObject & { id: string };

type SearchConfig = {
	path: string;
	toName: (item: ListItem) => string;
	toUrl?: (item: ListItem) => string | undefined;
	/** Query param the API uses for server-side search. Without it, the page is filtered locally. */
	searchParam?: string;
	paginated?: boolean;
};

async function searchList(
	this: ILoadOptionsFunctions,
	config: SearchConfig,
	filter?: string,
	paginationToken?: string,
): Promise<INodeListSearchResult> {
	const qs: IDataObject = {};
	if (config.paginated !== false) {
		qs.limit = 100;
		if (paginationToken) qs.starting_after = paginationToken;
	}
	if (filter && config.searchParam) qs[config.searchParam] = filter;

	const response = (await chattieApiRequest.call(
		this,
		'GET',
		config.path,
		qs,
	)) as ChattieListResponse<ListItem>;

	let results: INodeListSearchItems[] = response.data.map((item) => ({
		name: config.toName(item),
		value: item.id,
		url: config.toUrl?.(item),
	}));

	if (filter && !config.searchParam) {
		const needle = filter.toLowerCase();
		results = results.filter((result) => result.name.toLowerCase().includes(needle));
	}

	return {
		results,
		paginationToken:
			config.paginated !== false && response.has_more
				? (response.next_cursor ?? undefined)
				: undefined,
	};
}

const byName = (item: ListItem) => String(item.name ?? item.id);

export async function getAgents(this: ILoadOptionsFunctions, filter?: string, token?: string) {
	return await searchList.call(this, { path: '/api/v1/agents', toName: byName }, filter, token);
}

export async function getCampaigns(this: ILoadOptionsFunctions, filter?: string, token?: string) {
	return await searchList.call(
		this,
		{ path: '/api/v1/campaigns', toName: (item) => `${byName(item)} (${String(item.status)})` },
		filter,
		token,
	);
}

export async function getLeadLists(this: ILoadOptionsFunctions, filter?: string, token?: string) {
	return await searchList.call(this, { path: '/api/v1/lead-lists', toName: byName }, filter, token);
}

export async function getLeads(this: ILoadOptionsFunctions, filter?: string, token?: string) {
	return await searchList.call(
		this,
		{
			path: '/api/v1/leads',
			searchParam: 'search',
			toName: (item) =>
				[item.full_name, item.current_company].filter(Boolean).join(' · ') || item.id,
			toUrl: (item) => (item.linkedin_url as string | undefined) ?? undefined,
		},
		filter,
		token,
	);
}

export async function getLinkedInAccounts(
	this: ILoadOptionsFunctions,
	filter?: string,
	token?: string,
) {
	return await searchList.call(
		this,
		{ path: '/api/v1/linkedin-accounts', toName: byName },
		filter,
		token,
	);
}

export async function getOfferings(this: ILoadOptionsFunctions, filter?: string, token?: string) {
	return await searchList.call(this, { path: '/api/v1/offerings', toName: byName }, filter, token);
}

export async function getPipelineStages(this: ILoadOptionsFunctions, filter?: string) {
	return await searchList.call(
		this,
		{ path: '/api/v1/pipeline/stages', toName: byName, paginated: false },
		filter,
	);
}
