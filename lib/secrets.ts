import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import { SecretClient } from "@azure/keyvault-secrets";
import { DefaultAzureCredential } from "@azure/identity";

// AWS Secrets Manager: fetch and parse JSON secret
export async function getSecretsAWS(secretId?: string) {
  const id = secretId || process.env.SECRET_ARN;
  if (!id) throw new Error("SECRET_ARN or secretId must be provided");

  const client = new SecretsManagerClient({ region: process.env.AWS_REGION });
  const cmd = new GetSecretValueCommand({ SecretId: id });
  const res = await client.send(cmd);

  if (!res.SecretString) throw new Error("Secret has no SecretString");
  try {
    return JSON.parse(res.SecretString);
  } catch (e) {
    return { __raw: res.SecretString };
  }
}

// Azure Key Vault: fetch single secret by name
export async function getSecretAzure(vaultName?: string, secretName?: string) {
  const vn = vaultName || process.env.KEYVAULT_NAME;
  const sn = secretName || process.env.AZURE_SECRET_NAME;
  if (!vn || !sn) throw new Error("KEYVAULT_NAME and AZURE_SECRET_NAME are required");

  const url = `https://${vn}.vault.azure.net`;
  const credential = new DefaultAzureCredential();
  const client = new SecretClient(url, credential);
  const secret = await client.getSecret(sn);
  return secret.value;
}

export default {
  getSecretsAWS,
  getSecretAzure,
};
