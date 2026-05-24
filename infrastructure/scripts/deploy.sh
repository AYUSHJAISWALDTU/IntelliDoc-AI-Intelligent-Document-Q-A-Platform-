#!/usr/bin/env bash
set -euo pipefail

echo "=== IntelliDoc AI Deploy ==="

AWS_REGION="${AWS_REGION:-us-east-1}"
ECR_REGISTRY="${ECR_REGISTRY:-}"
TAG="${GITHUB_SHA:-latest}"

# Build and push backend
docker build -t intellidoc-backend:$TAG ./backend
docker tag intellidoc-backend:$TAG $ECR_REGISTRY/intellidoc-backend:$TAG
docker push $ECR_REGISTRY/intellidoc-backend:$TAG

# Build and push frontend
docker build -t intellidoc-frontend:$TAG ./frontend
docker tag intellidoc-frontend:$TAG $ECR_REGISTRY/intellidoc-frontend:$TAG
docker push $ECR_REGISTRY/intellidoc-frontend:$TAG

# Force ECS redeployment
aws ecs update-service --cluster intellidoc-cluster --service intellidoc-backend --force-new-deployment --region $AWS_REGION
aws ecs update-service --cluster intellidoc-cluster --service intellidoc-worker --force-new-deployment --region $AWS_REGION

echo "=== Deploy triggered ==="
