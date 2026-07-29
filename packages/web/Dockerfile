FROM node:24-alpine

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/web/package.json packages/web/package.json
RUN pnpm install --filter web... --frozen-lockfile

COPY packages/web packages/web

EXPOSE 5173
CMD ["pnpm", "--filter", "@daily/web", "dev", "--", "--host", "0.0.0.0"]
