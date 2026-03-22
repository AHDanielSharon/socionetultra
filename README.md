# SOCIONET

SOCIONET is a Render-ready foundation for a next-generation decentralized global social app.

## What this repository includes

- A deployable Next.js application with a complete SOCIONET product definition.
- A `render.yaml` blueprint for **single-deploy setup** on Render.
- Product modules covering identity, messaging, calls, feeds, videos, discovery, AI, privacy, and ecosystem expansion.

## Deploy on Render (single deploy)

1. Push this repo to GitHub.
2. In Render, choose **New + > Blueprint**.
3. Select this repository.
4. Render reads `render.yaml` and provisions one web service automatically.
5. Click deploy.

## Local development

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Build and production run

```bash
npm run build
PORT=3000 npm run start
```

## Notes

- This foundation is intentionally one-service deployable.
- As features expand, you can still keep one-click deployment by extending `render.yaml` with managed services (database, redis, workers) while preserving a single blueprint deploy workflow.
