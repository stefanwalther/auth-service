
_{%=name%}_ can be configured by the following environment variables:

- `PORT` - The port to run the REST API (defaults to `3010`).
- `JWT_SECRET` - The secret uses for JWT.

**Nodemailer:**   
(e.g for sending an account verification message):

- `NODEMAILER_API_USER`
- `NODEMAILER_API_KEY`
- `NODEMAILER_FROM`
- `NODEMAILER_BCC`

Nodemailer settings only need to be set if **one** of the following options are set to `true`:

- `ENABLE_ACCOUNT_VERIFICATION` - Force users to verify their accounts.
- `ENABLE_PWD_RESET` - Allow to reset the account's password.