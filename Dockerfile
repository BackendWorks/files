FROM node:14-alpine
RUN apk add --no-cache --virtual .build-deps alpine-sdk python3
RUN mkdir -p /var/www/files
WORKDIR /var/www/files
ADD . /var/www/files
RUN npm install
CMD npm start