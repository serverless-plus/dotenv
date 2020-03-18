const fs = require('fs')
const dotenv = require('dotenv')
const ensureIterable = require('type/iterable/ensure')
const ensureString = require('type/string/ensure')
const { Component } = require('@serverless/core')
const { program } = require('commander')

program.option('--debug', 'Debug component')
program.option('--env <env>', 'Target dotenv file', 'development')
program.parse(process.argv)

class DotenvComponent extends Component {
  getEnvironment() {
    if (process.env.NODE_ENV) {
      return process.env.NODE_ENV
    }

    const { env } = program

    if (env) {
      return env
    }

    return 'develepment'
  }

  resolveEnvFileName({ envFile, envPath }) {
    if (envFile) {
      return envFile
    }
    const env = this.getEnvironment()
    const basePath = envPath ? envPath : process.cwd()
    const defaultPath = `${basePath}/.env`
    const path = `${basePath}/.env.${env}`

    return fs.existsSync(path) ? path : defaultPath
  }

  async default(inputs = {}) {
    const envFile = ensureString(inputs.envFile, { default: '' })
    const envPath = ensureString(inputs.envPath, { default: '' })
    const exclude = ensureIterable(inputs.exclude, { default: [], ensureItem: ensureString })

    const { context } = this

    const state = {
      envFile: inputs.envFile,
      envPath: inputs.envPath
    }

    const envFileName = this.resolveEnvFileName({
      envFile,
      envPath
    })

    context.debug(`DOTENV: Loading environment variables from ${envFileName}`)
    const envVars = dotenv.config({ path: envFileName }).parsed
    if (envVars) {
      if (exclude.length > 0) {
        Object.keys(envVars)
          .filter((key) => exclude.includes(key))
          .forEach((key) => {
            delete envVars[key]
          })
      }

      state.envVars = envVars

      Object.keys(envVars).forEach((key) => {
        process.env[key] = envVars[key]
      })
    } else {
      context.debug('DOTENV: Could not find .env file.')
    }

    state.envFileName = envFileName
    this.state = state
    await this.save()

    return {
      env: envVars
    }
  }

  async remove() {
    this.state = {}
    await this.save()
    return {}
  }
}

module.exports = DotenvComponent
