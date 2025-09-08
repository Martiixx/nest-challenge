<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest


## Description

NestJs challenge for product management with external data synchronization capabilities. The application serves as a product catalog system tath integrates with externa APIs to automatically sync product data into a database.

## Local Installation

```bash
$ npm install
```

## Before running the app

Before running the app, copy the .env.example file to a new file .env and setup your secrets.

In order to use the private methods you have to create a jwt token from www.jwt.io . I will provide one jwt created for this porpuse. Please use the default data from this site and the JWT secret as: a-string-secret-at-least-256-bits-long

```bash
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM0NTY3ODkwIiwidXNlcm5hbWUiOiJKb2huIERvZSIsImVtYWlsIjoidXNlckBtYWlsLmNvbSJ9.nM28gs3kh9vCKKj-PtCKuaFb2MIN0WWe2EH3283igPM
```

## Before running docker

The app will automatically sync the data on startup, no need to force anything manually. In any case I have added an endpoint to trigger a manual sync.


## Run docker-compose

```bash
# set postgres database image and app
$ docker-compose up --build
```

After docker is built and running, you can access http:localhost:3000/api/docs for swagger.

## Running the app for development

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run docker-compose

```bash
# set postgres database image and app
$ docker-compose up --build
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```