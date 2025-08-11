import { Construct } from "constructs";
import { TerraformOutput } from "cdktf";
import { S3Bucket } from "@cdktf/provider-aws/lib/s3-bucket";
import { S3BucketVersioning } from "@cdktf/provider-aws/lib/s3-bucket-versioning";
import { S3BucketServerSideEncryptionConfiguration } from "@cdktf/provider-aws/lib/s3-bucket-server-side-encryption-configuration";
import { S3BucketPublicAccessBlock } from "@cdktf/provider-aws/lib/s3-bucket-public-access-block";

export interface S3Config {
  bucketName: string;
  environment: string;
  versioning: boolean;
  encryption: boolean;
  tags: { [key: string]: string };
}

export class S3Module extends Construct {
  public readonly s3Bucket: S3Bucket;

  constructor(scope: Construct, id: string, config: S3Config) {
    super(scope, id);

    // Create S3 bucket
    this.s3Bucket = new S3Bucket(this, "s3_bucket", {
      bucket: config.bucketName,
      tags: {
        Name: config.bucketName,
        Environment: config.environment,
        ...config.tags
      }
    });

    // Enable versioning if specified
    if (config.versioning) {
      new S3BucketVersioning(this, "s3_versioning", {
        bucket: this.s3Bucket.id,
        versioningConfiguration: {
          status: "Enabled"
        }
      });
    }

    // Enable server-side encryption if specified
    if (config.encryption) {
      new S3BucketServerSideEncryptionConfiguration(this, "s3_encryption", {
        bucket: this.s3Bucket.id,
        rule: [{
          applyServerSideEncryptionByDefault: {
            sseAlgorithm: "AES256"
          }
        }]
      });
    }

    // Block public access
    new S3BucketPublicAccessBlock(this, "s3_public_access_block", {
      bucket: this.s3Bucket.id,
      blockPublicAcls: true,
      blockPublicPolicy: true,
      ignorePublicAcls: true,
      restrictPublicBuckets: true
    });

    // Outputs
    new TerraformOutput(this, "s3_bucket_name", {
      value: this.s3Bucket.bucket,
      description: "S3 bucket name"
    });

    new TerraformOutput(this, "s3_bucket_arn", {
      value: this.s3Bucket.arn,
      description: "S3 bucket ARN"
    });
  }
} 