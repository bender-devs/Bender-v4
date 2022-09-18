# Developing Bender

## Pre-requisites

_**Before running Bender, make sure you have Node.JS & NPM installed**_

### MongoDB & Redis

You'll need to spin up Redis & MongoDB to run Bender. The easiest way to do this is with [Docker](https://docker.com/).

### Environment

Run the following command:

```bash
$ cp example.env .env
```

And fill in the environment variables. You will only need to supply a token for Bender Alpha in the `TOKEN_ALPHA` key, instead of all the `TOKEN_xxx` keys.

### Installing Packages

Run the following command **before** installing the application packages:

```bash
$ npm run preinstall
```

The preinstall script will install Typescript on your system, pinned at version `4.7.3`. Then, run the following command to install the required packages:

```bash
$ npm install
```

## Running Bender

Run the following command to compile the application, and copy the `.env` file to the compiled output folder:

```bash
$ npm run prestart
```

Then, finally start the application:

```bash
$ npm run start
```