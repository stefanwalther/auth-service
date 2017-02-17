# auth-service

> Auth service (for sammler).

[![CircleCI](https://img.shields.io/circleci/project/github/sammler/auth-service.svg)](https://circleci.com/gh/sammler/auth-service)

## Configuration
_auth-service_ can be configured by the following environment variables:

- `PORT` - The port to run the REST API (defaults to `3010`).

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
Released under the MIT license.

