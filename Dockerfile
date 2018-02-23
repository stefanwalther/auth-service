FROM node:8.9.4@sha256:e54e8d37bd8c85b3f607a4978d0d50c21cba0e6a3e132651ea0f19b5dfc76203

ENV HOME /home
RUN mkdir -p $HOME
WORKDIR $HOME

COPY package.json package-lock.json ./

RUN npm install

COPY /src ./src/

EXPOSE 3010

CMD ["npm", "run", "start"]
