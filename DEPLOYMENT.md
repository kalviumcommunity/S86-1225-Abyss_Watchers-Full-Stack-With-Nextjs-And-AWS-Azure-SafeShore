Deployment Guide — Docker, AWS ECS & Azure App Service

This document explains how to build the Docker image, push it to a container registry, and deploy to AWS ECS (Fargate) or Azure App Service for Containers. It also lists required CI/CD secrets and reflections on production considerations.

1) Dockerfile (production, multi-stage)

- Location: project root `Dockerfile` (multi-stage builder + runner)

Contents (already added):

- Builder stage uses `node:18-alpine`, runs `npm ci`, and runs `npm run build`.
- Runner stage sets `NODE_ENV=production`, copies `node_modules`, `.next`, and `public`, exposes port 3000 and runs `npm run start`.

Notes:
- Use `PORT` environment variable or App Service / ECS container port configuration to change listening port.
- Keep base image small (alpine) to reduce cold-starts.

2) Local build & test

Build:

```bash
docker build -t nextjs-app:local .
```

Run locally:

```bash
docker run -e PORT=3000 -p 3000:3000 nextjs-app:local
```

Visit: http://localhost:3000

3) CI/CD — GitHub Actions (examples in `.github/workflows`)

- `deploy-aws-ecs.yml` — Builds image, pushes to ECR, and forces a new deployment for the ECS service.
  Required repository secrets:
  - `AWS_ACCESS_KEY_ID`
  - `AWS_SECRET_ACCESS_KEY`
  - `AWS_REGION` (e.g., ap-south-1)
  - `ECR_REPO` (full repo URI: <account>.dkr.ecr.<region>.amazonaws.com/nextjs-app)
  - `ECS_CLUSTER` (ECS cluster name)
  - `ECS_SERVICE` (ECS service name)

- `deploy-azure-appservice.yml` — Logs into Azure, pushes image to ACR, and updates Web App container settings.
  Required repository secrets:
  - `AZURE_CREDENTIALS` (service principal JSON for `azure/login`)
  - `ACR_NAME` (name of your Azure Container Registry)
  - `AZURE_RESOURCE_GROUP` (resource group containing the Web App)
  - `WEBAPP_NAME` (App Service name)

4) Registry push examples

AWS ECR (manual):

```bash
aws ecr get-login-password --region <region> | docker login --username AWS --password-stdin <account>.dkr.ecr.<region>.amazonaws.com
docker tag nextjs-app:local <account>.dkr.ecr.<region>.amazonaws.com/nextjs-app:latest
docker push <account>.dkr.ecr.<region>.amazonaws.com/nextjs-app:latest
```

Azure ACR (manual):

```bash
az acr login --name <acrName>
docker tag nextjs-app:local <acrName>.azurecr.io/nextjs-app:latest
docker push <acrName>.azurecr.io/nextjs-app:latest
```

5) Deploy runtime configuration

AWS ECS (Fargate) recommended settings (starter):
- CPU: 256 (0.25 vCPU)
- Memory: 512 MB
- Port mapping: container 3000
- Health check: path `/` or `/api/health` (if present)
- Auto-scaling: scale based on CPU with min 1 – max 3 tasks

Azure App Service for Containers (starter):
- Container port: 3000
- Startup command: `npm run start` (if custom needed)
- Autoscale: configure rules on CPU or HTTP queue length

6) Observability & production considerations

- Cold starts: keep container image small; consider a minimal background warm-up or keep minimum task count > 0.
- Health checks: configure both container and load balancer health checks to quickly restart unhealthy tasks.
- Logging: stream logs to CloudWatch (AWS) or App Insights/Log Stream (Azure). Ensure `stdout`/`stderr` logging is enabled.
- Resource sizing: start small (512MB / 0.25 vCPU) and stress-test; right-size based on latency percentiles.

7) Post-deploy verification

- Check the service or web app URL in cloud console.
- View container logs for errors.
- Run a simple load test (e.g., `ab` or `wrk`) to confirm scaling and latency.

8) Deliverables in this repo

- `Dockerfile` — multi-stage production build
- `.github/workflows/deploy-aws-ecs.yml` — AWS ECR + ECS example
- `.github/workflows/deploy-azure-appservice.yml` — ACR + App Service example

9) Next steps & checklist for you

- Create required secrets in GitHub Settings → Secrets
- Create ECR/ACR repositories and push images once to verify permissions
- Create ECS task definition or Web App in Azure and test a manual deployment

If you want, I can:
- Add an ECS task definition JSON template, or
- Create a GitHub Action step that registers an ECS task definition with an explicit image name (for immutable deployment tags)

-- End of deployment guide
 
10) Domain & SSL (Route 53 / Azure DNS)

Overview

- Choose one provider (AWS or Azure) depending on where you host your app. Use your domain registrar to point nameservers to Route 53 or Azure DNS.

DNS setup (Route 53)

1. Create a Hosted Zone in Route 53 for `yourdomain.com`.
2. Copy the NS records and update nameservers at your domain registrar.
3. Add an A (Alias) record pointing to your load balancer (ALB / NLB) or the App Service IP/DNS.
  - Name: `yourdomain.com`
  - Type: `A` (Alias) → select the load balancer DNS
4. (Optional) Add a CNAME for `www` pointing to the root domain.

DNS setup (Azure DNS)

1. Create a DNS Zone in Azure for `yourdomain.com`.
2. Update your registrar to use the Azure-provided NS records.
3. Add an A record pointing to your App Service's IP, or a CNAME for `www` to yourapp.azurewebsites.net.

Requesting SSL

AWS (ACM)

1. Open AWS Certificate Manager → Request a certificate → Public certificate.
2. Enter `yourdomain.com` and `*.yourdomain.com` (if you want wildcard).
3. Choose DNS validation — ACM will give you a CNAME record.
4. Add the validation CNAME into Route 53 (ACM can auto-add when same account).
5. Wait until status is `Issued`. Attach the certificate to your Load Balancer or CloudFront distribution.

Azure (App Service Certificate / Managed Certificate)

1. In App Service, go to TLS/SSL settings → Private Key Certificates (.pfx) or create a Managed Certificate.
2. Verify ownership by validating DNS records or via the App Service process.
3. Bind the certificate to your custom domain under TLS/SSL bindings.

Enforce HTTPS

- On AWS: configure ALB listener rule to redirect port 80 → 443.
- On Azure App Service: toggle `HTTPS Only` to ON.
- In-app: for extra protection (and behind proxies), middleware now redirects HTTP → HTTPS using `x-forwarded-proto` or `x-arr-ssl`.

Verification

- Visit https://yourdomain.com and confirm the padlock (🔒).
- Inspect DevTools → Security to confirm a valid certificate.
- Run https://www.ssllabs.com/ssltest/ for a full grade and recommended improvements.

Notes & reflections

- Use DNS validation where possible to automate renewals (ACM auto-renews public certs).
- Keep separate subdomains for environments (staging, prod) and separate certificates if necessary.
- For global CDN (CloudFront / Azure CDN) put TLS termination at the CDN and enable HTTP->HTTPS redirect there for best performance.

Add screenshots to `docs/screenshots/` showing:
- Route 53 / Azure DNS record set
- ACM / App Service certificate status
- Browser padlock for the live site

-- End Domain & SSL section
