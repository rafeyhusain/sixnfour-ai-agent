import { Construct } from "constructs";
import { TerraformOutput } from "cdktf";
import { LambdaFunction } from "@cdktf/provider-aws/lib/lambda-function";
import { IamRole } from "@cdktf/provider-aws/lib/iam-role";
import { IamRolePolicyAttachment } from "@cdktf/provider-aws/lib/iam-role-policy-attachment";
import { DataAwsIamPolicyDocument } from "@cdktf/provider-aws/lib/data-aws-iam-policy-document";

export interface LambdaConfig {
  functionName: string;
  runtime: string;
  handler: string;
  codePath: string;
  environment: string;
  tags: { [key: string]: string };
}

export class LambdaModule extends Construct {
  public readonly lambdaFunction: LambdaFunction;
  public readonly lambdaRole: IamRole;

  constructor(scope: Construct, id: string, config: LambdaConfig) {
    super(scope, id);

    // Create IAM role for Lambda
    const assumeRolePolicy = new DataAwsIamPolicyDocument(this, "assume_role_policy", {
      statement: [{
        effect: "Allow",
        principals: [{
          type: "Service",
          identifiers: ["lambda.amazonaws.com"]
        }],
        actions: ["sts:AssumeRole"]
      }]
    });

    this.lambdaRole = new IamRole(this, "lambda_role", {
      name: `${config.functionName}-role`,
      assumeRolePolicy: assumeRolePolicy.json,
      tags: config.tags
    });

    // Attach basic Lambda execution policy
    new IamRolePolicyAttachment(this, "lambda_basic_policy", {
      role: this.lambdaRole.name,
      policyArn: "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
    });

    // Create Lambda function
    this.lambdaFunction = new LambdaFunction(this, "lambda_function", {
      functionName: config.functionName,
      role: this.lambdaRole.arn,
      runtime: config.runtime,
      handler: config.handler,
      filename: config.codePath,
      tags: {
        Name: config.functionName,
        Environment: config.environment,
        ...config.tags
      }
    });

    // Outputs
    new TerraformOutput(this, "lambda_function_name", {
      value: this.lambdaFunction.functionName,
      description: "Lambda function name"
    });

    new TerraformOutput(this, "lambda_function_arn", {
      value: this.lambdaFunction.arn,
      description: "Lambda function ARN"
    });
  }
} 