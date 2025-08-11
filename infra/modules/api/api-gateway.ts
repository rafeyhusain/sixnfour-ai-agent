import { Construct } from "constructs";
import { TerraformOutput } from "cdktf";
import { ApiGatewayRestApi } from "@cdktf/provider-aws/lib/api-gateway-rest-api";
import { ApiGatewayResource } from "@cdktf/provider-aws/lib/api-gateway-resource";
import { ApiGatewayMethod } from "@cdktf/provider-aws/lib/api-gateway-method";
import { ApiGatewayIntegration } from "@cdktf/provider-aws/lib/api-gateway-integration";
import { ApiGatewayDeployment } from "@cdktf/provider-aws/lib/api-gateway-deployment";
import { ApiGatewayStage } from "@cdktf/provider-aws/lib/api-gateway-stage";

export interface ApiGatewayConfig {
  apiName: string;
  environment: string;
  lambdaFunctionArn: string;
  tags: { [key: string]: string };
}

export class ApiGatewayModule extends Construct {
  public readonly restApi: ApiGatewayRestApi;
  public readonly apiStage: ApiGatewayStage;

  constructor(scope: Construct, id: string, config: ApiGatewayConfig) {
    super(scope, id);

    // Create REST API
    this.restApi = new ApiGatewayRestApi(this, "rest_api", {
      name: config.apiName,
      description: `API Gateway for ${config.apiName}`,
      tags: {
        Name: config.apiName,
        Environment: config.environment,
        ...config.tags
      }
    });

    // Create API resource
    const apiResource = new ApiGatewayResource(this, "api_resource", {
      restApiId: this.restApi.id,
      parentId: this.restApi.rootResourceId,
      pathPart: "api"
    });

    // Create method
    const apiMethod = new ApiGatewayMethod(this, "api_method", {
      restApiId: this.restApi.id,
      resourceId: apiResource.id,
      httpMethod: "POST",
      authorization: "NONE"
    });

    // Create integration with Lambda
    new ApiGatewayIntegration(this, "api_integration", {
      restApiId: this.restApi.id,
      resourceId: apiResource.id,
      httpMethod: apiMethod.httpMethod,
      integrationHttpMethod: "POST",
      type: "AWS_PROXY",
      uri: `arn:aws:apigateway:${config.environment}:lambda:path/2015-03-31/functions/${config.lambdaFunctionArn}/invocations`
    });

    // Create deployment
    const deployment = new ApiGatewayDeployment(this, "api_deployment", {
      restApiId: this.restApi.id,
      dependsOn: [apiMethod]
    });

    // Create stage
    this.apiStage = new ApiGatewayStage(this, "api_stage", {
      deploymentId: deployment.id,
      restApiId: this.restApi.id,
      stageName: config.environment,
      tags: {
        Name: `${config.apiName}-${config.environment}`,
        Environment: config.environment,
        ...config.tags
      }
    });

    // Outputs
    new TerraformOutput(this, "api_gateway_url", {
      value: `${this.restApi.executionArn}${this.apiStage.stageName}`,
      description: "API Gateway URL"
    });

    new TerraformOutput(this, "api_gateway_id", {
      value: this.restApi.id,
      description: "API Gateway ID"
    });
  }
} 