# RBAC Demonstration

## Demo Boundary

The initial role switcher is a visualization of a possible Microsoft Entra ID group design. It is not authentication, authorization, or evidence that a user is allowed to access business data. The demo uses only synthetic data and must visibly label the active role as simulated.

## Roles and Eligible Domains

| Demo role | Finance Monitoring | Planning and Engineering | IT Project Monitoring |
| --- | --- | --- | --- |
| Executive | Summary metrics | Portfolio summaries | Portfolio summaries |
| Finance Analyst | Detailed financial signals | No access | No access |
| Planning Engineer | No access | Detailed planning and engineering signals | No access |
| IT Project Manager | No access | No access | Detailed project and environment signals |

Each synthetic item will have a domain, a classification label, and a list of eligible roles. When the user changes the demo role, the page must update the visible source indicators, suggested questions, and server-supplied model context.

## Expected Interface Behavior

The interface will show:

- The simulated active role.
- The domains that role can access.
- A compact eligibility matrix or source list.
- Suggested questions limited to eligible data.
- An explanation when a question requires an ineligible domain.

The backend will reject invalid role values and construct Azure OpenAI context from only the role-filtered synthetic records. This is useful for demonstrating desired behavior, but it is not a substitute for identity-based access control.

## Production Path

A production implementation should replace the switcher with Microsoft Entra ID sign-in and implement the following controls:

1. Define Entra ID security groups or application roles with business owners.
2. Validate tokens and group/app-role claims on the server for every API request.
3. Resolve claims into a server-side policy decision before fetching or passing data to the model.
4. Enforce the same row, record, project, and environment permissions in each connected source system.
5. Return only approved, minimum-necessary source content to the model.
6. Record access decisions and security events according to the approved retention policy, without unnecessarily storing conversation content.

## Integration Requirements

Before connecting live systems, identify each source system's owner, API or database interface, data classification, permission model, rate limits, and audit requirements. The following integration categories are anticipated:

| Domain | Planned source category | Authorization requirement |
| --- | --- | --- |
| Financial Monitoring | Financial monitoring system | Financial entity, account, and reporting permissions. |
| Planning and Engineering | Planning and engineering system | Project, asset, document, and engineering-record permissions. |
| IT Project Monitoring | IT project and staging/test monitoring system | Project, environment, and operational-data permissions. |

The application must not infer eligibility from the chat prompt. It must receive or enforce authoritative permissions before retrieving source data.