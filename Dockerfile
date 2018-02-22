FROM node:8.9.4

ENV HOME /home
RUN mkdir -p $HOME
WORKDIR $HOME

COPY package.json package-lock.json ./

RUN npm install

COPY /src ./src/

EXPOSE 3010

CMD ["npm", "run", "start"]
