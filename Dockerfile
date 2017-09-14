FROM node:latest 

ENV PORT 18340

COPY . /webhook-server
WORKDIR /webhook-server

RUN npm install

EXPOSE 18340

CMD ["node ", "server.js"]