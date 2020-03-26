# Serverless Dotenv Component

[![npm](https://img.shields.io/npm/v/%40slsplus%2Fdotenv)](http://www.npmtrends.com/%40slsplus%2Fdotenv)
[![NPM downloads](http://img.shields.io/npm/dm/%40slsplus%2Fdotenv.svg?style=flat-square)](http://www.npmtrends.com/%40slsplus%2Fdotenv)

## Introduction

Inspired by [serverless-dotenv-plugin](https://github.com/colynb/serverless-dotenv-plugin).

Preload environment variables into serverless. If you have variables stored in a .env file that you want loaded into your serverless yaml config. This will allow you to reference them as \${Dotenv.env.VAR_NAME} inside your config(If you ).

## Setup

Add `@slsplus/dotenv` in your `serverless.yml`, as below:

```yml
Dotenv:
  component: '@slsplus/dotenv'
```

Now create `.env` file in the project root:

```yml
TENCENT_SECRET_ID=xxx
TENCENT_SECRET_KEY=xxx

ABC=124
```

## Automatic Env file name resolution

By default, the component looks for the file: .env. If you want different env files based on environment. For example:

```
.env.development
.env.production
```

Then you can exec deploy command like:

```bash
$ NODE_ENV=development serverless --debug
```

Or, like this:

```bash
$ serverless --debug --env development
```

## Inject custom arguments to command

You can directly run deploy command with custom arguments:

```bash
$ serverless --debug --custom abc --custom1 123
```

Then you can use by `process.env.custom` and `process.env.custom1`

## Options

#### Complete configuration in `serverless.yml`

```yml
# serverless.yml

Dotenv:
  component: '@serverless/dotenv-component'
  inputs:
    envFile: /path/to/my/.env
    envPath: /path/to/my/
    exclude:
      - SECRET
```

#### Configuration description

| Param   | Required/Optional | Type   | Default         | Description                                     |
| ------- | ----------------- | ------ | --------------- | ----------------------------------------------- |
| envFile | Optional          | String | .env            | Dotenv file                                     |
| envPath | Optional          | String | `process.cwd()` | Dotenv file path                                |
| exclude | Optional          | string | []              | Variable in .env file, you don't want to expose |

## More Components

[awesome-serverless-framework](https://github.com/yugasun/awesome-serverless-framework)

## License

Copyright (c) 2020 Serverless Plus
