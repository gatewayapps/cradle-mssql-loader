import { CradleLoaderBase, IConsole, PropertyTypes } from '@gatewayapps/cradle'
import ModelReference, { RelationTypes } from '@gatewayapps/cradle/dist/lib/ModelReference'
import PropertyType from '@gatewayapps/cradle/dist/lib/PropertyTypes/PropertyType'

export class MsSqlLoader extends CradleLoaderBase {
  public readModelReferenceNames(modelName: string): Promise<string[]> {
    console.log('in readModelReferenceNames')
    return Promise.resolve([])
  }

  public readModelReferenceType(modelName: string, referenceName: string): Promise<ModelReference> {
    console.log('in readModelReferenceType')
    return Promise.resolve(new ModelReference('', '', RelationTypes.Single))
  }

  public readModelPropertyType(modelName: string, propertyName: string): Promise<PropertyType> {
    console.log('in readModelPropertyType')
    return Promise.resolve(new PropertyTypes.BooleanPropertyType())
  }

  public readModelNames(): Promise <string[]> {
    console.log('in readModelNames')
    return Promise.resolve([])
  }

  public readModelPropertyNames(modelName: string): Promise<string[]> {
    console.log('in readModelPropertyNames')
    return Promise.resolve([])
  }

  public readModelMetadata(modelName: string): Promise<object> {
    console.log('in readModelMetadata')
    return Promise.resolve({})
  }

  public prepareLoader(options: {[key: string]: any}, console: IConsole): Promise<void> {
    console.log('in prepareLoader')
    return Promise.resolve()
  }
}
