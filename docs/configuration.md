
_{%=name%}_ can be configured by the following environment variables:

- `PORT` - The port to run the REST API (defaults to `3010`).
- `JWT_SECRET` - The secret used for JWT.

**MongoDB:**

- `MONGODB_DEBUG` - Whether to use the Mongoose debug mode or not, defaults to `false`.
- `MONGODB_HOST` - MongoDB host, defaults to `localhost`.
- `MONGODB_PORT` - MongoDB port, defaults to `27017`. 

**RabbitMQ:**
- `RABBITMQ_EVENTS` - Whether to send events to RabbitMQ or not, defaults to `false`.


**Nodemailer:**   
(e.g for sending an account verification message):

- `NODEMAILER_API_USER` - 
- `NODEMAILER_API_KEY` - 
- `NODEMAILER_FROM` - 
- `NODEMAILER_BCC` - 

Nodemailer settings only need to be set if **one** of the following options are set to `true`:

- `ENABLE_ACCOUNT_VERIFICATION` - Force users to verify their accounts.
- `ENABLE_PWD_RESET` - Allow to reset the account's password.