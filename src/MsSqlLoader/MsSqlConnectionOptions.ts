import { ConnectionConfig } from 'tedious'
const pkg = require('../../package.json')

export class MsSqlConnectionOptions {
  public static parse(options: {[key: string]: any}): MsSqlConnectionOptions {
    if (!options.server || typeof options.server !== 'string') {
      throw new TypeError(`options.server is required and should be a string`)
    }

    if (!options.databaseName || typeof options.databaseName !== 'string') {
      throw new TypeError(`options.databaseName is required and should be a string`)
    }

    if (!options.userName || typeof options.userName !== 'string') {
      throw new TypeError(`options.userName is required and should be a string`)
    }

    if (!options.password || typeof options.password !== 'string') {
      throw new TypeError(`options.password is required and should be a string`)
    }

    return new MsSqlConnectionOptions(options.server, options.databaseName, options.userName, options.password)
  }

  public databaseName: string
  public server: string
  public userName: string
  public password: string

  constructor(server: string, databaseName: string, userName: string, password: string) {
    this.server = server
    this.databaseName = databaseName
    this.userName = userName
    this.password = password
  }

  public getConnectionConfig(): ConnectionConfig {
    const serverParts = this.server.split(/:|,|\\/)
    const userParts = this.userName.split('\\')

    let port: number | undefined
    let instanceName: string | undefined

    if (serverParts.length > 1) {
      if (isNaN(parseInt(serverParts[1], undefined))) {
        instanceName = serverParts[1]
      } else {
        port = parseInt(serverParts[1], undefined)
      }
    } else {
      port = 1433
    }

    return {
      domain: userParts.length > 1 ? userParts[0] : undefined,
      options: {
        appName: pkg.name,
        database: this.databaseName,
        encrypt: false,
        instanceName,
        port,
      },
      password: this.password,
      server: serverParts[0],
      userName: userParts.length > 1 ? userParts[1] : userParts[0],
    }
  }
}
