# NGCP Central AI

NGCP Central AI is a planned one-page demonstration chatbot for financial monitoring, planning and engineering, and IT project monitoring. The demo uses a real Azure OpenAI model and synthetic business data. It does not connect to production systems, persist conversation content, or implement production authorization.

## Documentation

- [Architecture](docs/architecture.md): application boundaries, Azure resources, and data handling.
- [Deployment](docs/deployment.md): Azure and GitHub Actions deployment prerequisites and workflow.
- [Azure provisioning checklist](docs/azure-provisioning-checklist.md): resources to create, access assignments, and safe configuration values to provide.
- [RBAC demonstration](docs/rbac-demo.md): the simulated role switcher, eligible data, and the path to real Microsoft Entra ID authorization.

## Demo Scope

The first release will include:

- A responsive, single-page chat experience backed by Azure OpenAI.
- Synthetic signals for Finance Monitoring, Planning and Engineering, and IT Project Monitoring.
- A role switcher for Executive, Finance Analyst, Planning Engineer, and IT Project Manager views.
- Azure deployment to East US through Bicep, Azure Container Apps, and GitHub Actions.

The first release will not include live business-system connectors, Microsoft Entra ID sign-in, persistent chat history, Azure AI Search, or production audit retention.

## Data Handling

The demo is designed not to store conversations. Prompts, answers, and retrieved context must not be written to application storage or logged as telemetry payloads. Only operational telemetry that excludes conversation bodies and credentials may be enabled.

## Status

The responsive application foundation and protected Azure OpenAI API route are implemented. Azure infrastructure-as-code and continuous deployment are the next implementation phase.