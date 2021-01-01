FROM node:14 as build

RUN npm i npm@latest -g

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN chmod +x docker-entrypoint.sh

RUN npx prisma generate
RUN npm run build

FROM node:14-slim

WORKDIR /app

# Needed for prisma
RUN apt-get update \
  && apt-get install --no-install-recommends -y openssl \
  && rm -rf /var/lib/apt/lists/*

USER node

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package*.json ./
COPY --from=build /app/build ./build
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/docker-entrypoint.sh ./

# I wonder how we deal with this???
COPY --from=build /app/.env ./.env

EXPOSE 8080
# CMD ["node", "build/index.js"]
ENTRYPOINT [ "/app/docker-entrypoint.sh" ]
CMD ["node", "./build/index.js"]