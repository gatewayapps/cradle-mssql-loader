const cradle = require('@gatewayapps/cradle')
const path = require('path')

const loaderOptions = new cradle.LoaderOptions(path.resolve(__dirname, '../dist/index.js'), {
  databaseName: '<DATABASE_NAME_HERE>',
  password: '<PASSWORD_HERE>',
  server: '<IP_ADDRESS_HERE>',
  userName: '<USERNAME_HERE>',
}, console)

const emitters = [
  {
    module: 'spec',
    name: 'spec',
    options: {
      outputPath: './out/spec-out2.yaml',
      overwriteExisting: true
    }
  }
]

const cradleConfig = new cradle.CradleConfig(loaderOptions, emitters)

module.exports = cradleConfig
