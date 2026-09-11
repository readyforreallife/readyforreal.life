FROM node:24-bookworm-slim
WORKDIR /app/services/safety-operations
RUN apt-get update && apt-get install -y --no-install-recommends gosu && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY core.mjs server.mjs mail.mjs ./
RUN mkdir -p /private-data
ENV HOST=0.0.0.0 PORT=8789 DATABASE_PATH=/private-data/safety.sqlite
EXPOSE 8789
CMD ["sh","-c","chown -R node:node /private-data && exec gosu node node server.mjs"]
