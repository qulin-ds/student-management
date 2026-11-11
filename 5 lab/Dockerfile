# Назначение: собрать SSR-приложение и запустить Node, не статический nginx.
# Вход: package-lock.json и исходники; выход: .output. Java и БД запускаются отдельно.
# Связи: .dockerignore, nuxt.config.ts, .env.example; ориентир из 4 lab — только этапы сборки.
# TODO: после реализации cookies использовать HTTPS и NUXT_COOKIE_SECURE=true.
# Проверка: команды docker build/run в README; backend не требуется для сборки заглушек.
FROM node:24.21.0-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts
COPY . .
RUN npm run postinstall && npm run typecheck && npm run build

FROM node:24.21.0-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
COPY --from=build --chown=node:node /app/.output ./.output
USER node
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
