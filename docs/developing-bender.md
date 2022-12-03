# Developing Bender

## Pre-requisites

_**Before running Bender, make sure you have Node.JS & NPM installed**_

### MongoDB & Redis

You'll need to spin up Redis & MongoDB to run Bender. *MongoDB will require additional setup for access control; details on how to do this may be added later.*

### Environment

Run the following command to create a file for environment variables:

*(On Windows use `copy` instead of `cp`)*

```bash
$ cp example.env .env
```

And fill in the environment variables. You will only need to supply a token for Bender Alpha in the `TOKEN_ALPHA` key, instead of all the `TOKEN_xxx` keys.

### Installing Packages

All dependencies are included in `package.json` and can be installed with:

```bash
$ npm i
```

You may need to configure your code editor to use the local folder's copy of TypeScript; Bender requires version `4.7.3` or higher.

## Running Bender

Assuming Redis and MongoDB are running, all you need to do to run Bender is:

```bash
$ npm start
```

This will automatically run the `prestart` script, which will transpile the code and copy your `.env` file to the `dist` folder.
