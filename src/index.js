const fs = require('fs')
const dotenv = require('dotenv')
const ensureIterable = require('type/iterable/ensure')
const ensureString = require('type/string/ensure')
const { Component } = require('@serverless/core')
const yargsParser = require('yargs-parser')

const cmdArgs = yargsParser(process.argv)

const specialArgs = ['_', 'env']

class DotenvComponent extends Component {
  getEnvironment() {
    if (process.env.NODE_ENV) {
      return process.env.NODE_ENV
    }

    const { env } = cmdArgs

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
    // add custom args
    const customArgs = {}
    Object.keys(cmdArgs).forEach((key) => {
      if (specialArgs.indexOf(key) === -1) {
        const temp = cmdArgs[key]
        process.env[key] = temp
        customArgs[key] = temp
      }
    })

    state.envFileName = envFileName
    state.customArgs = customArgs
    this.state = state
    await this.save()

    return {
      env: envVars,
      customArgs
    }
  }

  async remove() {
    this.state = {}
    await this.save()
    return {}
  }
}

module.exports = DotenvComponent
