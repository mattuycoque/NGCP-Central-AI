@description('Azure region for the document retrieval resources.')
param location string = resourceGroup().location

@description('Globally unique Storage account name. Use lowercase letters and numbers only.')
param storageAccountName string = 'ngcpdocs${take(uniqueString(subscription().id, resourceGroup().id), 15)}'

@description('Globally unique Azure AI Search service name.')
param searchServiceName string = 'ngcpsearch${take(uniqueString(subscription().id, resourceGroup().id), 15)}'

@description('Private Blob container holding the canonical demo documents.')
param documentContainerName string = 'ngcp-demo-documents'

@description('Object ID of the future runtime managed identity. Leave empty until Container Apps infrastructure exists.')
param runtimePrincipalId string = ''

var storageBlobDataReaderRoleId = subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '2a2b9908-6ea1-4ae2-8e65-a410df84e7d1')
var searchIndexDataReaderRoleId = subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '1407120a-92aa-4202-b7e9-c0dff0e7d622')

resource storageAccount 'Microsoft.Storage/storageAccounts@2023-05-01' = {
  name: storageAccountName
  location: location
  kind: 'StorageV2'
  sku: {
    name: 'Standard_LRS'
  }
  properties: {
    accessTier: 'Hot'
    allowBlobPublicAccess: false
    allowSharedKeyAccess: false
    defaultToOAuthAuthentication: true
    minimumTlsVersion: 'TLS1_2'
    publicNetworkAccess: 'Enabled'
    supportsHttpsTrafficOnly: true
  }
}

resource blobService 'Microsoft.Storage/storageAccounts/blobServices@2023-05-01' = {
  parent: storageAccount
  name: 'default'
}

resource documentContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-05-01' = {
  parent: blobService
  name: documentContainerName
  properties: {
    publicAccess: 'None'
  }
}

resource searchService 'Microsoft.Search/searchServices@2023-11-01' = {
  name: searchServiceName
  location: location
  sku: {
    name: 'basic'
  }
  properties: {
    disableLocalAuth: true
    hostingMode: 'default'
    partitionCount: 1
    publicNetworkAccess: 'enabled'
    replicaCount: 1
  }
}

resource runtimeBlobReader 'Microsoft.Authorization/roleAssignments@2022-04-01' = if (!empty(runtimePrincipalId)) {
  name: guid(storageAccount.id, runtimePrincipalId, storageBlobDataReaderRoleId)
  scope: storageAccount
  properties: {
    principalId: runtimePrincipalId
    principalType: 'ServicePrincipal'
    roleDefinitionId: storageBlobDataReaderRoleId
  }
}

resource runtimeSearchReader 'Microsoft.Authorization/roleAssignments@2022-04-01' = if (!empty(runtimePrincipalId)) {
  name: guid(searchService.id, runtimePrincipalId, searchIndexDataReaderRoleId)
  scope: searchService
  properties: {
    principalId: runtimePrincipalId
    principalType: 'ServicePrincipal'
    roleDefinitionId: searchIndexDataReaderRoleId
  }
}

output storageAccountName string = storageAccount.name
output storageAccountUrl string = 'https://${storageAccount.name}.blob.${environment().suffixes.storage}'
output documentContainerName string = documentContainer.name
output searchEndpoint string = 'https://${searchService.name}.search.windows.net'
output searchServiceName string = searchService.name