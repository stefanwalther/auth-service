
_{%=name%}_ can be configured by the following environment variables:

**General:**

- `PORT` - The port to run the REST API (defaults to `3010`).
- `JWT_SECRET` - The secret used for JWT, defaults to `foo`'
- `NODE_ENV` - Environment settings for the service (`production`, `development` or `test`), defaults to `development`.

**MongoDB:**

- `MONGODB_DATABASE` - The MongoDB database, defaults to `db`.
- `MONGODB_HOST` - MongoDB host, defaults to `localhost`.
- `MONGODB_PORT` - MongoDB port, defaults to `27017`. 
- `MONGODB_DEBUG` - Whether to use the Mongoose debug mode or not, defaults to `false`.

**NATS-Streaming:**

- `NATS_STREAMING_HOST` - The NATS-Streaming host, defaults to `localhost`.
- `NATS_STREAMING_PORT` - The NATS-Streaming port, defaults to `4222`.

**Nodemailer:**
(e.g for sending an account verification message):

- `NODEMAILER_API_USER` - Nodemailer's API user.
- `NODEMAILER_API_KEY` - Nodemailer's API key.
- `NODEMAILER_FROM` - eMail-address to send messages from.
- `NODEMAILER_BCC` - (optional) eMail-address(es) to send the message BCC.

Nodemailer settings only need to be set if **one** of the following options are set to `true`:

---

**Behavior:**

- `ENABLE_ACCOUNT_VERIFICATION` - Force users to verify their accounts (_not working, yet_).
- `ENABLE_PWD_RESET` - Allow to reset the account's password (_not working, yet_).
- `ENABLE_AUDIT_LOG` - Whether to enable the audit log or not, can be `true` or `false`, defaults to `true`.
