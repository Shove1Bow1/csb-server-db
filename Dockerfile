FROM node:18-alpine3.16
COPY . /app
WORKDIR /app
RUN yarn
CMD ["yarn","start"]