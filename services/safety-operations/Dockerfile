FROM node:24-bookworm-slim
WORKDIR /app/services/safety-operations
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY core.mjs server.mjs mail.mjs ./
RUN mkdir -p /private-data && chown node:node /private-data
USER node
ENV HOST=0.0.0.0 PORT=8789 DATABASE_PATH=/private-data/safety.sqlite
EXPOSE 8789
CMD ["node", "server.mjs"]
