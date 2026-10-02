import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';
import {
	getAgents,
	getCampaigns,
	getLeadLists,
	getLeads,
	getLinkedInAccounts,
	getOfferings,
	getPipelineStages,
} from './listSearch';
import { activityDescription } from './resources/activity';
import { agentDescription } from './resources/agent';
import { analyticsDescription } from './resources/analytics';
import { blockListDescription } from './resources/blockList';
import { campaignDescription } from './resources/campaign';
import { conversationDescription } from './resources/conversation';
import { icpCriteriaDescription } from './resources/icpCriteria';
import { leadDescription } from './resources/lead';
import { leadListDescription } from './resources/leadList';
import { linkedInAccountDescription } from './resources/linkedInAccount';
import { messageDescription } from './resources/message';
import { offeringDescription } from './resources/offering';
import { pipelineStageDescription } from './resources/pipelineStage';
import { workspaceDescription } from './resources/workspace';
import { writingStyleDescription } from './resources/writingStyle';

export class Chattie implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Chattie',
		name: 'chattie',
		icon: { light: 'file:../../icons/chattie.svg', dark: 'file:../../icons/chattie.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Run LinkedIn prospecting in Chattie: leads, campaigns, conversations and metrics',
		defaults: {
			name: 'Chattie',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'chattieApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: '={{ ($credentials.baseUrl || "https://app.trychattie.com").replace(/\\/+$/, "") }}',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Activity', value: 'activity' },
					{ name: 'Agent', value: 'agent' },
					{ name: 'Analytics', value: 'analytics' },
					{ name: 'Block List', value: 'blockList' },
					{ name: 'Campaign', value: 'campaign' },
					{ name: 'Conversation', value: 'conversation' },
					{ name: 'ICP Filter', value: 'icpCriteria' },
					{ name: 'Lead', value: 'lead' },
					{ name: 'Lead List', value: 'leadList' },
					{ name: 'LinkedIn Account', value: 'linkedInAccount' },
					{ name: 'Message', value: 'message' },
					{ name: 'Offering', value: 'offering' },
					{ name: 'Pipeline Stage', value: 'pipelineStage' },
					{ name: 'Workspace', value: 'workspace' },
					{ name: 'Writing Style', value: 'writingStyle' },
				],
				default: 'lead',
			},
			...activityDescription,
			...agentDescription,
			...analyticsDescription,
			...blockListDescription,
			...campaignDescription,
			...conversationDescription,
			...icpCriteriaDescription,
			...leadDescription,
			...leadListDescription,
			...linkedInAccountDescription,
			...messageDescription,
			...offeringDescription,
			...pipelineStageDescription,
			...workspaceDescription,
			...writingStyleDescription,
		],
	};

	methods = {
		listSearch: {
			getAgents,
			getCampaigns,
			getLeadLists,
			getLeads,
			getLinkedInAccounts,
			getOfferings,
			getPipelineStages,
		},
	};
}
