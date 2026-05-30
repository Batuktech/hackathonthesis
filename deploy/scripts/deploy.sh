#!/usr/bin/env sh
set -eu

# Safe production deployment helper.
# Run from the repository root on the target server.
# This script does not hardcode server paths and does not delete data.

COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"
RUN_SEED="${RUN_SEED:-false}"
SKIP_GIT_PULL="${SKIP_GIT_PULL:-false}"
DEPLOY_REF="${DEPLOY_REF:-}"

if [ -n "$DEPLOY_REF" ] && [ -d ".git" ]; then
  echo "Checking out deploy ref $DEPLOY_REF..."
  git fetch --prune origin
  git checkout --detach "$DEPLOY_REF"
elif [ "$SKIP_GIT_PULL" != "true" ] && [ -d ".git" ]; then
  echo "Pulling latest code with fast-forward only..."
  git pull --ff-only
else
  echo "Skipping git update."
fi

echo "Validating Docker Compose config..."
docker compose -f "$COMPOSE_FILE" config >/dev/null

echo "Building production Docker images..."
docker compose -f "$COMPOSE_FILE" build

echo "Starting database..."
docker compose -f "$COMPOSE_FILE" up -d postgres

echo "Waiting for database readiness..."
docker compose -f "$COMPOSE_FILE" exec -T postgres sh -c 'until pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB"; do sleep 2; done'

echo "Running Prisma migrations..."
docker compose -f "$COMPOSE_FILE" run --rm backend pnpm prisma:migrate

if [ "$RUN_SEED" = "true" ]; then
  echo "Running Prisma seed..."
  docker compose -f "$COMPOSE_FILE" run --rm backend pnpm prisma:seed
fi

echo "Starting production services..."
docker compose -f "$COMPOSE_FILE" up -d

echo "Running health checks..."
COMPOSE_FILE="$COMPOSE_FILE" sh ./deploy/scripts/healthcheck.sh

echo "Deployment completed."
