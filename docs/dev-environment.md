

### Start the development environment

To start the development environment, go for

```sh
$ make up
```

This will essentially:

- Start MongoDB
- Start RabbitMQ
- Start a server running the auth-service (http://localhost:3010)
- Watch changes and re-start the server


### Only required services

If you only want to run required services (e.g. MongoDB, RabbitMQ, etc.) and run the node.js process on your machine, then go for

```sh
$ make up-deps
```

Then start the server using

```sh
$ npm run start:watch
```