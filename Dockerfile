ARG NODE_VER="8.9.4"

# --------------------------------------
#               BASE NODE
# --------------------------------------
FROM node:${NODE_VER} as BASE

ARG HOME_DIR="opt/auth-service"
ENV HOME_DIR $HOME_DIR
RUN mkdir -p $HOME_DIR
WORKDIR $HOME_DIR

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
RUN npm install --quiet

# --------------------------------------
#                  TEST
# --------------------------------------
# run linters, setup and tests
FROM dependencies AS TEST

COPY .eslintrc.json .
COPY /src ./src/
COPY /test ./test/

RUN  npm run lint:fix && npm run lint && npm run test:unit

# --------------------------------------
#                 RELEASE
# --------------------------------------
FROM node:${NODE_VER}-alpine as RELEASE

ARG PORT=3001
ENV PORT=${PORT}

ARG HOME_DIR="opt/auth-service"
ENV HOME_DIR $HOME_DIR
RUN mkdir -p $HOME_DIR
WORKDIR $HOME_DIR

COPY index.js package.json nodemon.json ./

# copy production node_modules
COPY --from=dependencies $HOME_DIR/prod_node_modules ./node_modules
COPY /src ./src/

EXPOSE $PORT

CMD ["npm", "run", "start"]
