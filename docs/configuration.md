
_{%=name%}_ can be configured by the following environment variables:

**General:**

- `PORT` - The port to run the REST API (defaults to `3010`).
- `JWT_SECRET` - The secret used for JWT.
- `AUDIT_LOG` - Whether to enable the audit log or not, can be `true` or `false`, defaults to `true`.

**MongoDB:**

- `MONGODB_DEBUG` - Whether to use the Mongoose debug mode or not, defaults to `false`.
- `MONGODB_HOST` - MongoDB host, defaults to `localhost`.
- `MONGODB_PORT` - MongoDB port, defaults to `27017`. 

**NATS-Streaming**
- `NATS_STREAMIING_SERVER`
- `NATS_STREAMING_CLUSTER`

**RabbitMQ:**

- `RABBITMQ_EVENTS` - Whether to send events to RabbitMQ or not, defaults to `false`.
- `RABBITMQ_HOST`

**Nodemailer:**
(e.g for sending an account verification message):

- `NODEMAILER_API_USER` - Nodemailer's API user.
- `NODEMAILER_API_KEY` - Nodemailer's API key.
- `NODEMAILER_FROM` - eMail-address to send messages from.
- `NODEMAILER_BCC` - (optional) eMail-address(es) to send the message BCC.

Nodemailer settings only need to be set if **one** of the following options are set to `true`:

**General Settings:**

- `ENABLE_ACCOUNT_VERIFICATION` - Force users to verify their accounts.
- `ENABLE_PWD_RESET` - Allow to reset the account's password.