FROM node:24-alpine

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/core/package.json packages/core/package.json
RUN pnpm install --filter core... --frozen-lockfile

COPY packages/core packages/core

EXPOSE 3000
CMD ["pnpm", "--filter", "@daily/core", "dev"]
