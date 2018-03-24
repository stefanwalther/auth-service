The following events are sent to RabbitMQ if the environment variable `RABBITMQ_EVENTS` is set to `true`.

- user.created
- user.validated
- user.login
- user.logout

If `RABBITMQ_EVENTS` is set to `true`, the following related environment variables need to be set:

