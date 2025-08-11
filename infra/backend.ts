import { TerraformBackend } from "cdktf";

export interface BackendConfig {
  environment: string;
  region: string;
}

export function configureBackend(config: BackendConfig): TerraformBackend {
  return new TerraformBackend("s3", {
    bucket: `ai-marketing-agent-terraform-state-${config.environment}`,
    key: `terraform.tfstate`,
    region: config.region,
    encrypt: true,
    dynamodbTable: `ai-marketing-agent-terraform-locks-${config.environment}`,
    tags: {
      Environment: config.environment,
      Project: "ai-marketing-agent",
      ManagedBy: "cdktf"
    }
  });
} 