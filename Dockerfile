FROM node:16-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN apk add --no-cache git python3 py3-pip make g++
RUN npm install

COPY . .

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]