FROM node:latest 

ENV PORT 18340
ENV DIR /data/node-test

COPY . /webhook-server
WORKDIR /webhook-server

RUN npm install

EXPOSE 18340

CMD ["npm", "start"]