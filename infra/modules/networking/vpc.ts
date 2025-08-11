import { Construct } from "constructs";
import { TerraformOutput } from "cdktf";
import { Vpc } from "@cdktf/provider-aws/lib/vpc";
import { Subnet } from "@cdktf/provider-aws/lib/subnet";
import { InternetGateway } from "@cdktf/provider-aws/lib/internet-gateway";
import { RouteTable } from "@cdktf/provider-aws/lib/route-table";
import { RouteTableAssociation } from "@cdktf/provider-aws/lib/route-table-association";
import { Route } from "@cdktf/provider-aws/lib/route";

export interface VpcConfig {
  cidrBlock: string;
  environment: string;
  availabilityZones: string[];
  publicSubnetCidrs: string[];
  privateSubnetCidrs: string[];
  tags: { [key: string]: string };
}

export class VpcModule extends Construct {
  public readonly vpc: Vpc;
  public readonly publicSubnets: Subnet[];
  public readonly privateSubnets: Subnet[];
  public readonly internetGateway: InternetGateway;

  constructor(scope: Construct, id: string, config: VpcConfig) {
    super(scope, id);

    // Create VPC
    this.vpc = new Vpc(this, "vpc", {
      cidrBlock: config.cidrBlock,
      enableDnsHostnames: true,
      enableDnsSupport: true,
      tags: {
        Name: `${config.environment}-vpc`,
        ...config.tags
      }
    });

    // Create Internet Gateway
    this.internetGateway = new InternetGateway(this, "internet_gateway", {
      vpcId: this.vpc.id,
      tags: {
        Name: `${config.environment}-igw`,
        ...config.tags
      }
    });

    // Create public subnets
    this.publicSubnets = config.publicSubnetCidrs.map((cidr, index) => {
      return new Subnet(this, `public_subnet_${index}`, {
        vpcId: this.vpc.id,
        cidrBlock: cidr,
        availabilityZone: config.availabilityZones[index],
        mapPublicIpOnLaunch: true,
        tags: {
          Name: `${config.environment}-public-subnet-${index + 1}`,
          Type: "Public",
          ...config.tags
        }
      });
    });

    // Create private subnets
    this.privateSubnets = config.privateSubnetCidrs.map((cidr, index) => {
      return new Subnet(this, `private_subnet_${index}`, {
        vpcId: this.vpc.id,
        cidrBlock: cidr,
        availabilityZone: config.availabilityZones[index],
        mapPublicIpOnLaunch: false,
        tags: {
          Name: `${config.environment}-private-subnet-${index + 1}`,
          Type: "Private",
          ...config.tags
        }
      });
    });

    // Create route table for public subnets
    const publicRouteTable = new RouteTable(this, "public_route_table", {
      vpcId: this.vpc.id,
      tags: {
        Name: `${config.environment}-public-rt`,
        ...config.tags
      }
    });

    // Add route to internet gateway
    new Route(this, "public_route", {
      routeTableId: publicRouteTable.id,
      destinationCidrBlock: "0.0.0.0/0",
      gatewayId: this.internetGateway.id
    });

    // Associate public subnets with public route table
    this.publicSubnets.forEach((subnet, index) => {
      new RouteTableAssociation(this, `public_rta_${index}`, {
        subnetId: subnet.id,
        routeTableId: publicRouteTable.id
      });
    });

    // Outputs
    new TerraformOutput(this, "vpc_id", {
      value: this.vpc.id,
      description: "VPC ID"
    });

    new TerraformOutput(this, "public_subnet_ids", {
      value: this.publicSubnets.map(subnet => subnet.id),
      description: "Public subnet IDs"
    });

    new TerraformOutput(this, "private_subnet_ids", {
      value: this.privateSubnets.map(subnet => subnet.id),
      description: "Private subnet IDs"
    });
  }
} 