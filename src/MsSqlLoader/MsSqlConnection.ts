import { IConsole } from '@gatewayapps/cradle'
import PropertyType from '@gatewayapps/cradle/dist/lib/PropertyTypes/PropertyType'
import { Connection, Request } from 'tedious'
import ConnectionPool from 'tedious-connection-pool'
import { MsSqlConnectionOptions } from './MsSqlConnectionOptions'
import { createPropertyType, IMsSqlColumnModel, IMsSqlTableModel } from './MsSqlUtils'

export class MsSqlConnection {
  private console: IConsole
  private options: MsSqlConnectionOptions
  private pool: ConnectionPool
  private modelCache: {[modelName: string]: IMsSqlTableModel} = {}

  constructor(options: MsSqlConnectionOptions, console: IConsole) {
    this.console = console
    this.options = options

    const poolConfig = {
      max: 30,
      min: 10,
    }
    this.pool = new ConnectionPool(poolConfig, this.options.getConnectionConfig())
    this.pool.on('error', (err) => {
      this.console.error('ConnectionPool Error:', err)
    })
  }

  public dispose() {
    this.pool.drain()
  }

  public async getModelMetadata(modelName): Promise<object> {
    if (this.modelCache[modelName]) {
      const model = this.modelCache[modelName]
      const metadata: any = {
        schemaName: model.schema_name,
        tableName: model.name,
      }
      if (model.columns) {
        metadata.properties = model.columns.reduce((obj, column) => {
          const columnMetadata: any = {
            sqlDataType: column.data_type
          }

          if (column.default_definition !== null) {
            columnMetadata.sqlDefault = column.default_definition
          }

          obj[column.name] = columnMetadata

          return obj
        }, {})
      }
      return metadata
    }

    return {}
  }

  public async getModelNames(): Promise<string[]> {
    const query = 'SELECT object_id, name, SCHEMA_NAME(schema_id) AS schema_name FROM sys.tables ORDER BY name'
    const connection = await this._getConnection()
    const results = await this._execSql<IMsSqlTableModel>(connection, query)
    connection.release()
    const modelNames: string[] = []
    results.forEach((model) => {
      this.modelCache[model.name] = model
      modelNames.push(model.name)
    })
    return modelNames
  }

  public async getModelPropertyNames(modelName: string): Promise<string[]> {
    const query = `
    SELECT c.[name], TYPE_NAME(c.user_type_id) AS data_type, c.max_length, c.[precision], c.scale, c.is_nullable,
      CAST(IIF(ixc.index_column_id IS NOT NULL, 1, 0) AS BIT) AS is_primary_key, c.is_identity, ic.seed_value,
      ic.increment_value, df.[definition] AS default_definition
    FROM sys.columns c
    LEFT OUTER JOIN sys.indexes ix ON ix.object_id = c.object_id AND ix.is_primary_key = 1
    LEFT OUTER JOIN sys.index_columns ixc ON ixc.object_id = c.object_id AND ixc.index_id = ix.index_id AND ixc.column_id = c.column_id
    LEFT OUTER JOIN sys.default_constraints df ON df.parent_object_id = c.object_id AND df.parent_column_id = c.column_id
    LEFT OUTER JOIN sys.identity_columns ic ON ic.object_id = c.object_id AND ic.column_id = c.column_id
    WHERE c.object_id = OBJECT_ID('${modelName}')
    `
    const connection = await this._getConnection()
    const results = await this._execSql<IMsSqlColumnModel>(connection, query)
    connection.release()
    if (this.modelCache[modelName]) {
      this.modelCache[modelName].columns = results
    }
    return results.map((column) => column.name)
  }

  public async getModelPropertyType(modelName: string, propertyName: string): Promise<PropertyType> {
    const model = this.modelCache[modelName]
    if (model !== undefined && model.columns !== undefined) {
      const column = model.columns.find((col) => col.name === propertyName)
      if (column !== undefined) {
        return createPropertyType(model, column)
      }
    }

    throw new Error(`Unable to find column definition for ${modelName}.${propertyName}`)
  }

  public async getModelReferenceNames(modelName: string): Promise<string[]> {
    const query = `SELECT OBJECT_NAME(referenced_object_id) AS RefName FROM sys.foreign_keys WHERE parent_object_id = OBJECT_ID('${modelName}')`
    const connection = await this._getConnection()
    const results = await this._execSql<{ RefName: string }>(connection, query)
    connection.release()
    return results.map((row) => row.RefName)
  }

  public async test(): Promise<void> {
    const connection = await this._getConnection()
    connection.release()
  }

  private _execSql<T>(connection: Connection, query: string): Promise<T[]> {
    return new Promise((resolve, reject) => {
      try {
        const results: T[] = []
        const request = new Request(query, (reqErr, rowCount) => {
          if (reqErr) {
            this.console.error(reqErr)
            return reject(reqErr)
          } else {
            return resolve(results)
          }
        })

        request.on('row', (columns) => {
          try {
            const rowData: any = columns.reduce((obj, column) => {
              obj[column.metadata.colName] = column.value
              return obj
            }, {})
            results.push(rowData as T)
          } catch (err) {
            this.console.error(err)
          }
        })

        request.on('error', (err) => {
          this.console.error(err)
        })

        connection.execSql(request)
      } catch (err) {
        return reject(err)
      }
    })
  }

  private _getConnection(): Promise<ConnectionPool.PooledConnection> {
    return new Promise<ConnectionPool.PooledConnection>((resolve, reject) => {
      try {
        this.pool.acquire((err, connection) => {
          if (err) {
            this.console.error(err)
            return reject(err)
          } else {
            return resolve(connection)
          }
        })
      } catch (err) {
        this.console.error(err)
        return reject(err)
      }
    })
  }
}
