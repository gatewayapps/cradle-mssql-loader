import { CradleLoaderBase, CradleSchema, IConsole } from '@gatewayapps/cradle'
import ModelReference, { RelationTypes } from '@gatewayapps/cradle/dist/lib/ModelReference'
import PropertyType from '@gatewayapps/cradle/dist/lib/PropertyTypes/PropertyType'
import { MsSqlConnection } from './MsSqlConnection'
import { MsSqlConnectionOptions } from './MsSqlConnectionOptions'


export class MsSqlLoader extends CradleLoaderBase {
  private console?: IConsole
  private connection?: MsSqlConnection

  public async readModelReferenceNames(modelName: string): Promise<string[]> {
    if (this.connection) {
      return this.connection.getModelReferenceNames(modelName)
    }

    throw new Error('MsSqlConnection is not defined');
  }

  public readModelReferenceType(modelName: string, referenceName: string): Promise<ModelReference> {
    if (this.connection) {
      return this.connection.getModelReferenceType(modelName, referenceName)
    }

    throw new Error('MsSqlConnection is not defined')
  }

  public readModelPropertyType(modelName: string, propertyName: string): Promise<PropertyType> {
    if (this.connection) {
      return this.connection.getModelPropertyType(modelName, propertyName)
    }

    throw new Error('MsSqlConnection is not defined')
  }

  public async readModelNames(): Promise <string[]> {
    if (this.connection) {
      const modelNames = await this.connection.getModelNames()
      return modelNames
    }

    throw new Error('MsSqlConnection is not defined')
  }

  public async readModelPropertyNames(modelName: string): Promise<string[]> {
    if (this.connection) {
      const propertyNames = await this.connection.getModelPropertyNames(modelName)
      return propertyNames
    }

    throw new Error('MsSqlConnection is not defined')
  }

  public readModelMetadata(modelName: string): Promise<object> {
    if (this.connection) {
      return this.connection.getModelMetadata(modelName)
    }

    throw new Error('MsSqlConnection is not defined')
  }

  public prepareLoader(options: {[key: string]: any}, console: IConsole): Promise<void> {
    try {
      this.console = console
      this.connection = new MsSqlConnection(MsSqlConnectionOptions.parse(options), this.console)
      return this.connection.test()
    } catch (err) {
      return Promise.reject(err)
    }
  }

  public finalizeSchema(schema: CradleSchema): Promise<CradleSchema> {
    if (this.connection) {
      this.connection.dispose()
      this.connection = undefined
    }
    return super.finalizeSchema(schema)
  }
}
