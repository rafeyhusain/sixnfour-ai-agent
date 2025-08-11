import { TerraformStack } from "cdktf";
import { Construct } from "constructs";
import { configureAwsProvider, ProviderConfig } from "../providers";
import { configureBackend, BackendConfig } from "../backend";

export interface DevStackConfig {
  environment: string;
  region: string;
  tags: { [key: string]: string };
}

export class DevStack extends TerraformStack {
  constructor(scope: Construct, id: string, config: DevStackConfig) {
    super(scope, id);

    // Configure S3 backend for state management
    configureBackend({
      environment: config.environment,
      region: config.region
    });

    // Configure AWS provider
    const providerConfig: ProviderConfig = {
      region: config.region,
      tags: config.tags
    };
    configureAwsProvider.call(this, providerConfig);

    // TODO: Add networking module
    // TODO: Add compute module
    // TODO: Add storage module
    // TODO: Add API module
  }
} 