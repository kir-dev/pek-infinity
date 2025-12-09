FROM node:22-alpine

WORKDIR /builder

COPY package.json package-lock.json ./

RUN npm install --ignore-scripts

COPY prisma.config.mjs ./
COPY prisma ./prisma

RUN POSTGRES_PRISMA_URL="postgres://example.com" npx prisma generate
ENTRYPOINT [ "npx", "prisma" ]