FROM node:22-alpine

WORKDIR /builder

COPY package.json package-lock.json ./

RUN npm install --ignore-scripts

COPY prisma.config.mjs ./
COPY prisma ./prisma

RUN npm run generate:prisma

ENTRYPOINT [ "npx", "prisma" ]