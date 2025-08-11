# AI Marketing Agent Infrastructure

This repository contains the Infrastructure as Code (IaC) for the AI Marketing Agent project using CDK for Terraform (CDKTF).

## Project Structure

```
├── cdktf.json              # CDKTF configuration
├── main.ts                 # Main application entry point
├── backend.ts              # S3 backend configuration
├── providers.ts            # AWS provider configuration
├── stacks/                 # Environment-specific stacks
│   ├── dev-stack.ts        # Development environment
│   ├── qa-stack.ts         # QA environment
│   └── prod-stack.ts       # Production environment
├── modules/                # Reusable infrastructure modules
│   ├── networking/         # VPC, subnets, gateways
│   ├── compute/            # EC2, Lambda, ECS/Fargate
│   ├── storage/            # S3, DynamoDB, RDS
│   └── api/                # API Gateway, Step Functions
└── ci-cd/                  # CI/CD pipeline configuration
    └── github-actions.yaml # GitHub Actions workflow
```

## Prerequisites

- Node.js 18 or higher
- AWS CLI configured with appropriate credentials
- Terraform (optional, CDKTF handles this)
- CDKTF CLI

## Installation

1. Install dependencies:

   ```bash
   npm install
   ```

2. Install CDKTF CLI globally:

   ```bash
   npm install -g cdktf-cli
   ```

3. Initialize the project:

   ```bash
   cdktf get
   ```

## Configuration

### AWS Credentials

Ensure your AWS credentials are configured via one of these methods:

- AWS CLI: `aws configure`
- Environment variables: `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`
- IAM roles (if running on EC2)

### Environment Variables

Set the following environment variables for different environments:

```bash
export AWS_REGION=us-east-1
export CDKTF_OUTPUT=cdk.out
```

## Usage

### Development

1. Synthesize the infrastructure:

   ```bash
   cdktf synth
   ```

2. Preview changes:

   ```bash
   cdktf diff --stack ai-marketing-agent-dev
   ```

3. Deploy to development:

   ```bash
   cdktf deploy --stack ai-marketing-agent-dev
   ```

### Production

1. Deploy to production:

   ```bash
   cdktf deploy --stack ai-marketing-agent-prod
   ```

### Destroy Infrastructure

```bash
cdktf destroy --stack ai-marketing-agent-dev
```

## CI/CD Pipeline

The project includes a GitHub Actions workflow that:

1. Validates infrastructure code
2. Tests changes in each environment
3. Deploys to dev, qa, and production environments
4. Uses environment protection rules for production

### Required Secrets

Configure these secrets in your GitHub repository:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

## Modules

### Networking Module

- VPC with public and private subnets
- Internet Gateway
- Route tables and associations

### Compute Module

- Lambda functions with IAM roles
- Auto-scaling configurations
- Container orchestration

### Storage Module

- S3 buckets with encryption
- DynamoDB tables
- RDS instances

### API Module

- API Gateway with Lambda integration
- Step Functions for workflow orchestration
- CloudWatch monitoring

## Environment Configuration

Each environment (dev, qa, prod) has its own stack with:

- Environment-specific resource configurations
- Different scaling and availability requirements
- Separate state management

## Security

- All resources are tagged with environment and project information
- S3 buckets have public access blocked
- IAM roles follow least privilege principle
- Encryption enabled for data at rest

## Contributing

1. Create a feature branch from `develop`
2. Make your changes
3. Test with `cdktf diff`
4. Submit a pull request

## License

MIT License - see LICENSE file for details.
