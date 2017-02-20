FROM kkarczmarczyk/node-yarn:latest

RUN yarn global add nodemon

ENV HOME /home
RUN mkdir -p $HOME
WORKDIR $HOME

COPY package.json yarn.lock ./

RUN yarn install

COPY /src ./src/

EXPOSE 3010

CMD ["yarn", "run", "start"]
