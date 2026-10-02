import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class ChattieApi implements ICredentialType {
	name = 'chattieApi';

	displayName = 'Chattie API';

	icon: Icon = { light: 'file:../icons/chattie.svg', dark: 'file:../icons/chattie.dark.svg' };

	documentationUrl = 'https://app.trychattie.com/api/docs';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			required: true,
			default: '',
			placeholder: 'e.g. ck_live_...',
			description:
				'Create a key in Chattie under Integrations → API Keys. It is shown only once, so copy it right away.',
		},
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://app.trychattie.com',
			description: 'Only change this if you were given a different Chattie environment URL',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl}}',
			url: '/api/v1/me',
			method: 'GET',
		},
	};
}
