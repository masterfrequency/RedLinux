# Build stage
FROM node:22-slim AS builder
WORKDIR /app
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml ./
RUN pnpm install
COPY . .
RUN pnpm build

# Production stage
FROM node:22-slim
WORKDIR /app
RUN npm install -g pnpm && \
    groupadd -r redlinux && useradd -r -g redlinux redlinux && \
    chown -R redlinux:redlinux /app
COPY --from=builder --chown=redlinux:redlinux /app/dist ./dist
COPY --from=builder --chown=redlinux:redlinux /app/package.json /app/pnpm-lock.yaml ./
USER redlinux
RUN pnpm install --prod
EXPOSE 3000
CMD ["pnpm", "start"]
