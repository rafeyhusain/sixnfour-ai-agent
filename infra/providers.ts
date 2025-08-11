import { AwsProvider } from "@cdktf/provider-aws/lib/aws-provider";

export interface ProviderConfig {
  region: string;
  tags?: { [key: string]: string };
}

export function configureAwsProvider(config: ProviderConfig): AwsProvider {
  return new AwsProvider(this, "aws", {
    region: config.region,
    defaultTags: {
      tags: config.tags || {}
    }
  });
} 