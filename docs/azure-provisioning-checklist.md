# Azure Provisioning Checklist

Use this checklist to prepare the Azure resources and non-secret configuration needed to make the NGCP Central AI demo work.

The current application uses Microsoft Entra ID credentials through `DefaultAzureCredential`. It does not require an Azure OpenAI API key and no key should be shared in chat, committed to the repository, or placed in browser configuration.

## Choose a Demo Path

| Path | What runs in Azure | Best for |
| --- | --- | --- |
| Local app with Azure OpenAI | Only the Azure OpenAI resource and model deployment. The Next.js app runs from this workspace. | The fastest functional demonstration. |
| Azure-hosted app | Azure OpenAI plus hosting, container registry, managed identity, and monitoring resources. | A shareable demo URL for stakeholders. |

Start with the local app path if the immediate goal is to validate model access and the chat experience. It has the fewest moving parts.

## Minimum Azure Provisioning

Complete these items in the Azure portal or with Azure CLI. Use **East US** unless your organization requires a different approved region.

- [ ] Select the Azure subscription approved for this demo.
- [ ] Create a dedicated resource group, for example `rg-ngcp-central-ai-demo-eastus`.
- [ ] Confirm that the subscription is approved to use Azure OpenAI and has available model quota in the selected region.
- [ ] Create an Azure OpenAI resource. Record its resource name and endpoint.
- [ ] Deploy a supported chat model to that resource. Choose a small, capable chat deployment suitable for a demo and record the **deployment name**. The deployment name is not necessarily the same as the model name.
- [ ] Assign the **Cognitive Services OpenAI User** role on the Azure OpenAI resource to the identity that will run the app.

## Document Grounding Provisioning

The local document-grounded demo has been provisioned in `rg-ngcp-central-ai-demo-eastus`:

- [x] Private StorageV2 account: `ngcpdocs6ksymucav5omy`.
- [x] Private Blob container: `ngcp-demo-documents`.
- [x] Azure AI Search Basic service: `ngcpsearch6ksymucav5omy`.
- [x] Chat deployment: `ngcp-chat` (`gpt-4.1-mini`, Global Standard).
- [x] Embedding deployment: `ngcp-embeddings` (`text-embedding-3-small`, Global Standard).
- [x] Local development user: **Storage Blob Data Contributor**, **Search Index Data Contributor**, and **Cognitive Services OpenAI User**.

For the future Container App managed identity, assign **Storage Blob Data Reader**, **Search Index Data Reader**, and **Cognitive Services OpenAI User**. Do not grant it Blob write, Search contributor, Storage keys, or Search keys.

Run `az bicep build --file infra/main.bicep`, then `az deployment group what-if --resource-group rg-ngcp-central-ai-demo-eastus --template-file infra/main.bicep` before any infrastructure change. Basic Azure AI Search and Azure OpenAI usage incur cost.

For local development, the running identity is normally your own Microsoft Entra user account after `az login`. For hosted deployment, it will be the managed identity assigned to the Azure Container App.

## Azure OpenAI Details to Provide Here

After the minimum provisioning is complete, provide these values in chat. They are identifiers and configuration values, not credentials.

| Value | Example format | Why it is needed |
| --- | --- | --- |
| Azure subscription ID | `00000000-0000-0000-0000-000000000000` | Required later to validate and deploy infrastructure. |
| Microsoft Entra tenant ID | `00000000-0000-0000-0000-000000000000` | Required later for GitHub OIDC and deployment configuration. |
| Resource group name | `rg-ngcp-central-ai-demo-eastus` | Identifies where resources belong. |
| Azure region | `eastus` | Confirms the deployment target. |
| Azure OpenAI endpoint | `https://your-resource.openai.azure.com` | Used by the server-side chat client. |
| Azure OpenAI deployment name | `ngcp-chat` | Selects the deployed model at runtime. |
| API version, only if different | `2024-10-21` | Defaults to this value in the application. |
| Model name and version | Your selected supported model/version | Lets us align quotas and infrastructure parameters. |
| Desired demo path | `local app` or `azure-hosted app` | Determines the next implementation/deployment step. |

Do **not** provide any of the following here: Azure OpenAI API keys, client secrets, access tokens, passwords, connection strings, GitHub personal access tokens, or `.env.local` file contents.

## Run Locally Against Azure OpenAI

Once your Entra user has the Azure OpenAI User role:

1. Sign in to Azure locally with `az login` and select the correct subscription.
2. Create a local-only `.env.local` file from [.env.example](../.env.example).
3. Set `AZURE_OPENAI_ENDPOINT` to the endpoint you recorded.
4. Set `AZURE_OPENAI_DEPLOYMENT` to the Azure OpenAI deployment name you created.
5. Keep `AZURE_OPENAI_API_VERSION=2024-10-21` unless your selected deployment requires another supported version.
6. Run `npm run dev` and open `http://localhost:3000`.

For document-grounded chat, also populate the Storage, Search, and embedding variables from `.env.example`, then run `npm run validate-documents` and `npm run ingest-documents`. These values are non-secret endpoints, names, and deployment identifiers; authentication continues to use `DefaultAzureCredential`.

Current corpus status:

- `12` synthetic NGCP-related Markdown source records are indexed.
- Coverage includes capital program finance, procurement commitments, cashflow bridge, network stage gates, design assurance and substation resilience, and digital operations (release readiness, SCADA uplift, SOC modernization).

The app will return a friendly configuration error until both endpoint and deployment name are set. If Azure returns an authorization error after configuration, verify that the signed-in Entra user has the **Cognitive Services OpenAI User** role on the Azure OpenAI resource.

## Additional Provisioning for an Azure-Hosted Demo

Do not create these until the app has been packaged and the infrastructure templates are added. They are the recommended target for a stakeholder-accessible demo.

- [ ] Azure Container Registry to store the application image.
- [ ] Azure Container Apps environment and Container App to run the Next.js service.
- [ ] User-assigned managed identity for the Container App.
- [ ] **AcrPull** role for the managed identity on the container registry.
- [ ] **Cognitive Services OpenAI User** role for the managed identity on the Azure OpenAI resource.
- [ ] Log Analytics workspace and Application Insights for health telemetry only. Prompt and response content must remain disabled.
- [ ] GitHub OIDC application registration or federated identity, with least-privilege deployment access to the demo resource group.

Key Vault is not required by the current managed-identity Azure OpenAI design. A database, live data connectors, automated public-web crawling, and Microsoft Entra ID end-user sign-in remain out of scope for this synthetic-data demo.

## Cost and Cleanup

Azure OpenAI usage is billed by model input and output tokens. Container Apps, Container Registry, and monitoring can also incur usage charges when the hosted path is enabled. Use a dedicated demo resource group and remove it when the demo is finished. Confirm that no shared resources are included before deleting the resource group.