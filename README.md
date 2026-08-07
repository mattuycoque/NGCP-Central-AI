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

The responsive application, protected Azure OpenAI API route, document-grounding corpus, private Blob Storage, Azure AI Search Basic service, and model deployments are implemented for local demonstration. Container Apps infrastructure and continuous deployment remain the next phase.

## Local Document-Grounded Demo

Copy `.env.example` to `.env.local` and set the non-secret endpoint, deployment, Storage, and Search values. Sign in with `az login` using an identity that has the required Azure OpenAI, Blob, and Search data-plane roles, then run:

```bash
npm run validate-documents
npm run ingest-documents
npm run dev
```

The canonical source documents live in `demo-documents/`. Synthetic records are explicitly fictional. Public records must be curator-reviewed, attributed snapshots, never crawled or mirrored source pages. Each grounded response displays only the exact source files cited by the model.