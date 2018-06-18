FROM node:10 as base

WORKDIR /app
COPY package.json /app/package.json

FROM base as builder
ENV NODE_ENV development
COPY src /app/src
COPY public /app/public
RUN npm install && npm run build

FROM base
RUN npm install
COPY --from=builder /app/build /app/build
COPY proxy.js /app/proxy.js
CMD npm run production
