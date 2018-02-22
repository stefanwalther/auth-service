FROM node:8.9.4@sha256:9d3c5b6b15c9f82f4f668a7bf8348730ccfdca6a7fceddfcd5ef446f597c41f3

ENV HOME /home
RUN mkdir -p $HOME
WORKDIR $HOME

COPY package.json package-lock.json ./

RUN npm install

COPY /src ./src/

EXPOSE 3010

CMD ["npm", "run", "start"]
