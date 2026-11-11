# Назначение: собрать Nuxt SSR и запустить production-сервер Node.js.
# Вход: исходники и package-lock.json; результат сборки: .output.
# Связи: .dockerignore, nuxt.config.ts и переменные runtimeConfig.
# Java API запускается отдельно; адрес задаётся через NUXT_JAVA_API_BASE при старте контейнера.
FROM node:24.21.0-alpine AS build

WORKDIR /app

ENV NUXT_TELEMETRY_DISABLED=1

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npm run typecheck && npm run build

FROM node:24.21.0-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
ENV NUXT_TELEMETRY_DISABLED=1

COPY --from=build --chown=node:node /app/.output ./.output

USER node

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
