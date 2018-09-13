import { CradleLoaderBase, CradleModel, CradleSchema, IConsole, PropertyTypes } from '@gatewayapps/cradle'
import ModelReference, { RelationTypes } from '@gatewayapps/cradle/dist/lib/ModelReference'
import PropertyType from '@gatewayapps/cradle/dist/lib/PropertyTypes/PropertyType'
import { MsSqlConnection } from './MsSqlConnection'
import { MsSqlConnectionOptions } from './MsSqlConnectionOptions'

export class MsSqlLoader extends CradleLoaderBase {
  private console?: IConsole
  private options?: {[key: string]: any}
  private connection?: MsSqlConnection

  public async readModelReferenceNames(modelName: string): Promise<string[]> {
    if (this.connection) {
      return this.connection.getModelReferenceNames(modelName)
    }

    throw new Error('MsSqlConnection is not defined')
  }

  public readModelReferenceType(modelName: string, referenceName: string): Promise<ModelReference> {
    // this.writeLog(`in readModelReferenceType for ${modelName}.${referenceName}`)
    return Promise.resolve(new ModelReference('', '', RelationTypes.Single))
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
    // this.writeLog(`in readModelMetadata for ${modelName}`)
    return Promise.resolve({})
  }

  public prepareLoader(options: {[key: string]: any}, console: IConsole): Promise<void> {
    try {
      this.console = console
      this.options = options
      this.connection = new MsSqlConnection(MsSqlConnectionOptions.parse(options), this.console)
      return this.connection.test()
    } catch (err) {
      return Promise.reject(err)
    }
  }

  public finalizeSchema(schema: CradleSchema): Promise<CradleSchema> {
    this.writeLog('in finializeSchema')
    if (this.connection) {
      this.connection.dispose()
      this.connection = undefined
    }
    return super.finalizeSchema(schema)
  }

  private writeLog(message: string) {
    if (this.console) {
      this.console.log(message)
    }
  }
}
