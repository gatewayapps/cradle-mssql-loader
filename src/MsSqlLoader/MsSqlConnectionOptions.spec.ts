import { expect } from 'chai'
import 'mocha'
import { MsSqlConnectionOptions } from './MsSqlConnectionOptions'

describe('MsSqlConnectionOptions getConnectionConfig()', () => {
  it('Should generate Tedious connection config', () => {
    const expectedConfig = {
      domain: undefined,
      options: {
        appName: '@gatewayapps/cradle-mssql-loader',
        database: 'testDatabase',
        encrypt: false,
        instanceName: undefined,
        port: 1433,
      },
      password: 'testPassword',
      server: 'localhost',
      userName: 'testUser',
    }

    const options = new MsSqlConnectionOptions('localhost', 'testDatabase', 'testUser', 'testPassword')
    const config = options.getConnectionConfig()

    expect(config).to.deep.equal(expectedConfig)
  })

  it('Should parse server and instanceName from "server\\instanceName"', () => {
    const options = new MsSqlConnectionOptions('localhost\\myInstance', 'testDatabase', 'testUser', 'testPassword')
    const config = options.getConnectionConfig()

    expect(config.server).to.equal('localhost')
    expect(config).to.have.property('options')
    if (config.options) {
      expect(config.options.instanceName).to.equal('myInstance')
    }
  })

  it('Should parse server and port from "server:port"', () => {
    const options = new MsSqlConnectionOptions('localhost:1234', 'testDatabase', 'testUser', 'testPassword')
    const config = options.getConnectionConfig()

    expect(config.server).to.equal('localhost')
    expect(config).to.have.property('options')
    if (config.options) {
      expect(config.options.port).to.equal(1234)
    }
  })

  it('Should parse server and port from "server,port"', () => {
    const options = new MsSqlConnectionOptions('localhost,1234', 'testDatabase', 'testUser', 'testPassword')
    const config = options.getConnectionConfig()

    expect(config.server).to.equal('localhost')
    expect(config).to.have.property('options')
    if (config.options) {
      expect(config.options.port).to.equal(1234)
    }
  })

  it('Should parse domain and username from "domain\\username"', () => {
    const options = new MsSqlConnectionOptions('localhost', 'testDatabase', 'myDomain\\testUser', 'testPassword')
    const config = options.getConnectionConfig()

    expect(config.domain).to.equal('myDomain')
    expect(config.userName).to.equal('testUser')
  })

  it('Should have undefined for instanceName when both port and instanceName are provided', () => {
    const options = new MsSqlConnectionOptions('localhost:1234\\testInstance', 'testDatabase', 'testUser', 'testPassword')
    const config = options.getConnectionConfig()

    expect(config.server).to.equal('localhost')
    expect(config).to.have.property('options')
    if (config.options) {
      expect(config.options.port).to.equal(1234)
      expect(config.options.instanceName).to.equal(undefined)
    }
  })
})
