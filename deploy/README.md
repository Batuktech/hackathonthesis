# Hetzner Deployment

This project is designed for a simple Hetzner VPS deployment with Docker Compose, host-level Nginx, and Certbot.

## Assumptions

- Ubuntu VPS.
- Domain points to the server.
- Docker Engine and Compose plugin installed.
- Nginx and Certbot installed on host.

## DNS

Create `A` records:

```text
thesis.example.com -> VPS_IP
www.thesis.example.com -> VPS_IP
```

## First Deploy

```bash
git clone <repo-url> thesis-orchestral-system
cd thesis-orchestral-system
cp .env.production.example .env
```

Edit `.env`:

```text
NEXT_PUBLIC_API_URL=https://thesis.example.com/api
CORS_ORIGIN=https://thesis.example.com
JWT_SECRET=replace-with-long-random-secret
POSTGRES_PASSWORD=replace-with-strong-postgres-password
DATABASE_URL=postgresql://postgres:replace-with-strong-postgres-password@postgres:5432/thesis_orchestral
```

Start containers:

```bash
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml exec backend pnpm prisma:migrate
docker compose -f docker-compose.prod.yml exec backend pnpm prisma:seed # optional demo data
```

## Nginx

Copy `deploy/nginx/thesis-orchestral.conf` into `/etc/nginx/sites-available/thesis-orchestral`.

```bash
sudo ln -s /etc/nginx/sites-available/thesis-orchestral /etc/nginx/sites-enabled/thesis-orchestral
sudo nginx -t
sudo systemctl reload nginx
```

The config routes:

- `/` to `127.0.0.1:3000`
- `/api/` to `127.0.0.1:4001/api/`
- `/health` to `127.0.0.1:4001/health`

## Certbot SSL

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d thesis.example.com -d www.thesis.example.com
```

## Update / Redeploy

```bash
sh deploy/scripts/deploy.sh
```

The deploy script validates Compose, builds images, starts PostgreSQL, runs Prisma migrations, starts the stack, then checks `/` and `/health`.

## GitHub Actions CI/CD

The `.github/workflows/ci-cd.yml` workflow runs on pull requests and pushes to `main`:

- Backend install, Prisma client generation, typecheck, and build.
- Frontend install, typecheck, and build.
- Production Docker Compose config validation and image build.
- Deployment to Hetzner after a successful push to `main`.

Create these GitHub repository secrets:

```text
HETZNER_HOST=your.server.ip.or.domain
HETZNER_USER=deploy
HETZNER_SSH_KEY=<private key for the deploy user>
HETZNER_PORT=22
HETZNER_APP_DIR=/opt/thesis-orchestral-system
```

Recommended first-time server layout:

```bash
sudo mkdir -p /opt/thesis-orchestral-system
sudo chown "$USER":"$USER" /opt/thesis-orchestral-system
git clone <repo-url> /opt/thesis-orchestral-system
cd /opt/thesis-orchestral-system
cp .env.production.example .env
```

Set real production values in `.env` on the VPS before enabling automatic deploys. Do not commit `.env`.

## Logs

```bash
docker compose -f docker-compose.prod.yml logs --tail=200 backend
docker compose -f docker-compose.prod.yml logs --tail=200 frontend
docker compose -f docker-compose.prod.yml logs --tail=200 postgres
```

## Health Checks

```bash
curl -fsS http://localhost/health
curl -fsS http://localhost
```

## Rollback

1. Check out the last known good commit.
2. Rebuild and restart:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

3. Run health checks.

## Backup Warning

Before migrations or server moves, back up:

- `postgres-data` Docker volume
- `uploads-data` Docker volume
- server `.env`

The upload volume contains thesis files. The Postgres volume contains users, scores, schedules, and critique workflow data.
