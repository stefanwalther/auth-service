# --------------------------------------
#               BASE NODE
# --------------------------------------
FROM node:8.6.0 as BASE

ARG PORT=3101
ENV PORT=$PORT

ENV HOME /opt/auth-service
RUN mkdir -p $HOME
WORKDIR $HOME

#COPY package.json package-lock.json ./
COPY package.json ./

# --------------------------------------
#              DEPENDENCIES
# --------------------------------------
FROM BASE as DEPENDENCIES

RUN npm install --only=production

# copy production node_modules aside
RUN cp -R node_modules prod_node_modules

# install ALL node_modules, including 'devDependencies'
RUN npm install


# --------------------------------------
#                 RELEASE
# --------------------------------------
FROM node:8.6.0-alpine as RELEASE

ARG PORT=3000
ENV PORT=$PORT

ENV HOME /opt/auth-service
RUN mkdir -p $HOME
WORKDIR $HOME

COPY index.js package.json nodemon.json ./

# copy production node_modules
COPY --from=dependencies $HOME/prod_node_modules ./node_modules
COPY /src ./src/

EXPOSE $PORT

CMD ["npm", "run", "start"]
