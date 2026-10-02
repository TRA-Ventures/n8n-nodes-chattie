# n8n-nodes-chattie

This is an n8n community node. It lets you use [Chattie](https://trychattie.com) — AI-powered LinkedIn prospecting — in your n8n workflows.

With it you can import leads, run campaigns, read conversations, message leads, manage the block list and pull metrics from your Chattie workspace.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/sustainable-use-license/) workflow automation platform.

[Installation](#installation) · [Operations](#operations) · [Credentials](#credentials) · [Compatibility](#compatibility) · [Usage](#usage) · [Resources](#resources)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation. The package name is `n8n-nodes-chattie`.

## Operations

| Resource             | Operations                                                                       |
| -------------------- | -------------------------------------------------------------------------------- |
| **Activity**         | Get Many (event log, filter by event type, campaign or lead)                     |
| **Agent**            | Create, Get, Get Many, Update                                                    |
| **Analytics**        | Get Stats (invites, acceptances, replies, goals, meetings and cost for a period) |
| **Block List**       | Block, Get Many, Unblock                                                         |
| **Campaign**         | Activate, Archive, Create, Get, Get Many, Pause, Unarchive, Update               |
| **Conversation**     | Get, Get Many, Get Messages                                                      |
| **ICP Filter**       | Create, Get Many                                                                 |
| **Lead**             | Get, Get Many (search, list, campaign and status filters)                        |
| **Lead List**        | Create, Get Leads, Get Many, Import Leads                                        |
| **LinkedIn Account** | Get Connections, Get Many                                                        |
| **Message**          | Send (outside of a campaign)                                                     |
| **Offering**         | Create, Get, Get Many, Update                                                    |
| **Pipeline Stage**   | Create, Get Many, Update                                                         |
| **Workspace**        | Get, Get Credits, Get Members                                                    |
| **Writing Style**    | Get Many, Set (from a preset or from text samples)                               |

All "Get Many" operations support **Return All**, following Chattie's cursor pagination automatically.

Operations that cost credits or LinkedIn quota:

- **Campaign → Activate** starts real prospecting: invitations and messages go out.
- **Message → Send** consumes one credit and one action of the daily LinkedIn quota.

## Credentials

The node uses a Chattie **API key**.

1. In Chattie, open **Integrations → API Keys** and create a key.
2. Select the scopes the workflow needs (for example `leads:read`, `leads:write`, `campaigns:read`, `messages:send`). A request to an operation without its scope fails with `403 insufficient_scope`.
3. Copy the key (`ck_live_...`). It is shown only once.
4. In n8n, create a **Chattie API** credential and paste the key. Leave **Base URL** as `https://app.trychattie.com` unless you were given another environment.

Effective scopes are the intersection of the key's scopes and the current role of the key's owner. Use **Workspace → Get** to see which scopes a key really has.

## Compatibility

Built and tested with `@n8n/node-cli` 0.50 and n8n 2.x. Requires Node.js 22.22 or later.

## Usage

**Import leads from a spreadsheet into a campaign list.** Google Sheets → Chattie (_Lead List → Import Leads_, input mode _One Lead per Item_, map the LinkedIn URL column). Duplicates and blocked people are reported in the output instead of failing.

**Send replies to your CRM.** Schedule Trigger → Chattie (_Activity → Get Many_, filter _Event Type_ = `reply_received`) → Chattie (_Conversation → Get Messages_) → your CRM.

**Weekly report.** Schedule Trigger → Chattie (_Analytics → Get Stats_ for the last 7 days) → Slack or email.

Notes:

- Create operations send an `Idempotency-Key` header. One is generated for each request; set **Options → Idempotency Key** to your own value to make retries safe across executions.
- **Lead List → Import Leads** accepts up to 200 leads per request in _JSON Array_ mode.
- **Analytics → Get Stats** uses only the date part of **From** (inclusive) and **To** (exclusive).
- When the API rate limit is reached it answers `429`. Turn on **Retry On Fail** in the node settings for long runs.

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
- [Chattie public API reference](https://app.trychattie.com/api/docs)
