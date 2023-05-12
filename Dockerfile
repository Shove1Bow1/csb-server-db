FROM node:18-alpine3.16
COPY . /app
WORKDIR /app
RUN yarn install
CMD ["yarn","start"]