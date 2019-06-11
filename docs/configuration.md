
_{%=name%}_ can be configured by the following environment variables:

**General:**

- `PORT` - The port to run the REST API (defaults to `3010`).
- `JWT_SECRET` - The secret used for JWT, defaults to `foo`'
- `NODE_ENV` - Environment settings for the service (`production`, `development` or `test`), defaults to `development`.

**MongoDB:**

Provide the connection to MongoDB either by providing a full connection string:

- `MONGODB_CONNECTION_STRING` - The full MongoDB connection string.

or by providing details of the connection:

- `MONGODB_DATABASE` - The MongoDB database, defaults to `db`.
- `MONGODB_HOST` - MongoDB host, defaults to `localhost`.
- `MONGODB_PORT` - MongoDB port, defaults to `27017`. 
- `MONGODB_DEBUG` - Whether to use the Mongoose debug mode or not, defaults to `false`.

**NATS-Streaming:**

- `NATS_STREAMING_HOST` - The NATS-Streaming host, defaults to `localhost`.
- `NATS_STREAMING_PORT` - The NATS-Streaming port, defaults to `4222`.

**Nodemailer:**
(e.g for sending an account verification message):

- `NODEMAILER_TRANSPORT` - The transport for Nodemailer (possible options: `postmark`).

Depending on the transporter for Nodemailer the following options can be set:

Postmark:

- `POSTMARK_API_TOKEN` - Postmark`s Server API Token.

Nodemailer settings only need to be set if **one** of the following options are set to `true`:
