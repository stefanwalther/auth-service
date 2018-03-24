### Run tests

Running and reviewing unit tests is a great way to get familiarized with a library and its API. You can install dependencies and run tests with the following command:

**Start MongoDB**:  
The following command will spin up a MongoDB instance to be used in the **integration tests** at port 27018 (to prevent conflicts with the default port).

```sh
$ npm run dc-dev-up
```

---

Then run one of the following options:

**Run integration tests**:

Spins up all required dependent services to run the integration tests and runs the integration tests:

```sh
$ make build-run-integration-tests
```


**Run unit tests**:
```sh
$ make build-run-unit-tests
```

---

