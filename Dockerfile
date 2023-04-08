FROM node:18-alpine3.16
COPY . /app
WORKDIR /app
RUN yarn install --production
CMD ["yarn","start"]