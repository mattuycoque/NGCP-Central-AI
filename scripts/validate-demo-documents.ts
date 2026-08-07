import { loadValidatedManifest } from "./document-manifest";

async function main(): Promise<void> {
	const manifest = await loadValidatedManifest();
	console.log(`Validated ${manifest.documents.length} demo documents.`);
}

void main();