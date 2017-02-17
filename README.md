# auth-service

> Auth service (for sammler).

[![CircleCI](https://img.shields.io/circleci/project/github/sammler/auth-service.svg)](https://circleci.com/gh/sammler/auth-service)

## Configuration
_auth-service_ can be configured by the following environment variables:

- `PORT` - The port to run the REST API (defaults to `3010`).

## Usage

### Routes
Once the Http server is up and listening, the following routes can be used:

- `GET /health-check`
- `POST /v1/register`
- `POST /v1/login`
- `POST /v1/logout`
- `GET /v1/status`
- `POST /v1/verify-token`
- `POST /v1/details`

## Development
Run 

```sh
$ yarn dc-dev-up
```

Which will spin up a MongoDB instance at port 27018 (to prevent conflicts with the default port).

Then run the tests:

```
$ yarn run test
```

## Author
**Stefan Walther**

* [github/stefanwalther](https://github.com/stefanwalther)
* [twitter/waltherstefan](http://twitter.com/waltherstefan)

## License
MIT

