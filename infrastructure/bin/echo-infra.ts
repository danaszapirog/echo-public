#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { EchoInfraStack } from '../lib/echo-infra-stack';

const app = new cdk.App();

// Development environment
new EchoInfraStack(app, 'EchoInfraStack-dev', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
  },
  environment: 'dev',
  description: 'Project Echo - Development Infrastructure',
});

// Staging environment (optional)
// new EchoInfraStack(app, 'EchoInfraStack-staging', {
//   env: {
//     account: process.env.CDK_DEFAULT_ACCOUNT,
//     region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
//   },
//   environment: 'staging',
//   description: 'Project Echo - Staging Infrastructure',
// });

// Production environment (optional)
// new EchoInfraStack(app, 'EchoInfraStack-prod', {
//   env: {
//     account: process.env.CDK_DEFAULT_ACCOUNT,
//     region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
//   },
//   environment: 'prod',
//   description: 'Project Echo - Production Infrastructure',
// });

