FROM node:18

WORKDIR /app
ADD . .
RUN yarn install
ENV NODE_ENV production
CMD ["node", "/app/packages/server/dist/index.js"]
