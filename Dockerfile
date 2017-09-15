FROM node:latest 

ENV PORT 18340
ENV PATH /data/node-test

COPY . /webhook-server
WORKDIR /webhook-server

RUN npm install

VOLUME /data

EXPOSE 18340

CMD ["npm", "start"]