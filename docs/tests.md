### Run tests

Running and reviewing unit tests is a great way to get familiarized with a library and its API. You can install dependencies and run tests with the following command:

**Start MongoDB**:  
The following command will spin up a MongoDB instance to be used in the **integration tests** at port 27018 (to prevent conflicts with the default port).

```sh
$ npm run dc-dev-up
```

---

Then run one of the following options:

**Run all tests** (both unit and integration tests):
```sh
$ npm run test
```

**Run integration tests**:

```sh
// A running MongoDB instance is required
$ npm run test:integration
```

**Run unit tests**:
```sh
$ npm run test:unit
```

**Run all tests and generate code-coverage**:
```sh
$ npm run test:coverage
```

---


