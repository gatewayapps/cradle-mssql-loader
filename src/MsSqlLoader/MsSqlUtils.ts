import { PropertyTypes } from '@gatewayapps/cradle'
import { IntegerAutogenerateOptions } from '@gatewayapps/cradle/dist/lib/PropertyTypes/IntegerPropertyType'

export interface IMsSqlTableModel {
  object_id: number
  name: string
  schema_name: string
  columns?: IMsSqlColumnModel[]
  references?: { [key: string]: IMsSqlReferenceModel }
}

export interface IMsSqlColumnModel {
  name: string
  data_type: string
  max_length: number
  precision: number
  scale: number
  is_nullable: boolean
  is_primary_key: boolean
  is_identity: boolean
  seed_value: number | null
  increment_value: number | null
  default_definition: string | null
}

export interface IMsSqlReferenceModel {
  object_id: number
  name: string
  ref_table: string
  columns: IMsSqlReferenceColumnModel[]
}

export interface IMsSqlReferenceColumnModel {
  object_id: number
  name: string
  local_table: string
  local_column: string
  ref_table: string
  ref_column: string
}

const DataTypes = {
  Binary: [ 'binary', 'varbinary', 'image' ],
  Boolean: [ 'bit' ],
  DateTime: [ 'date', 'datetime', 'datetime2' , 'datetimeoffset', 'smalldatetime', 'time' ],
  Decimal: [ 'decimal', 'numeric', 'smallmoney', 'money', 'real', 'float' ],
  Integer: [ 'tinyint', 'smallint', 'int', 'bigint' ],
  String: [ 'char', 'varchar', 'ntext' ],
  UnicodeString: [ 'nchar', 'nvarchar', 'ntext' ],
  Uniqueidentifier: [ 'uniqueidentifier' ],
}

export function createPropertyType(model: IMsSqlTableModel, column: IMsSqlColumnModel) {
  const dataType = column.data_type.toLowerCase()

  if (DataTypes.Boolean.indexOf(dataType) >= 0) {
    return createBooleanPropertyType(column)
  } else if (DataTypes.Binary.indexOf(dataType) >= 0) {
    return createBinaryPropertyType(column)
  } else if (DataTypes.Integer.indexOf(dataType) >= 0) {
    return createIntegerPropertyType(column)
  } else if (DataTypes.Decimal.indexOf(dataType) >= 0) {
    return createDecimalPropertyType(column)
  } else if (DataTypes.DateTime.indexOf(dataType) >= 0) {
    return createDateTimePropertyType(column)
  } else if (DataTypes.String.indexOf(dataType) >= 0 || DataTypes.UnicodeString.indexOf(dataType) >= 0) {
    return createStringPropertyType(column)
  } else if (DataTypes.Uniqueidentifier.indexOf(dataType) >= 0) {
    return createUniqueIdentifierPropertyType(column)
  } else {
    throw new Error(`Unsupported data type ${column.data_type} for ${model.name}.${column.name}`)
  }
}

function createBinaryPropertyType(column: IMsSqlColumnModel) {
  return new PropertyTypes.BinaryPropertyType(
    column.max_length > 0 ? column.max_length : undefined,
    column.is_nullable,
    column.is_primary_key,
    parseDefaultDefinition(column.default_definition)
  )
}

function createBooleanPropertyType(column: IMsSqlColumnModel) {
  return new PropertyTypes.BooleanPropertyType(
    column.is_nullable,
    column.is_primary_key,
    parseBooleanDefaultDefinition(column.default_definition)
  )
}

function createDateTimePropertyType(column: IMsSqlColumnModel) {
  return new PropertyTypes.DateTimePropertyType(
    column.is_nullable,
    column.is_primary_key,
    parseDateTimeDefaultDefinition(column.default_definition)
  )
}

function createDecimalPropertyType(column: IMsSqlColumnModel) {
  return new PropertyTypes.DecimalPropertyType(
    column.precision,
    column.scale,
    undefined, // minimumValue
    undefined, // maximumValue
    column.is_nullable,
    column.is_primary_key,
    parseDefaultDefinition(column.default_definition)
  )
}

function createIntegerPropertyType(column: IMsSqlColumnModel) {
  return new PropertyTypes.IntegerPropertyType(
    undefined, // minimumValue
    undefined, // maximumValue
    column.is_identity ? new IntegerAutogenerateOptions(column.seed_value || 1, column.increment_value || 1) : undefined,
    column.is_nullable,
    column.is_primary_key,
    parseDefaultDefinition(column.default_definition)
  )
}

function createStringPropertyType(column: IMsSqlColumnModel) {
  const maxLength = (column.max_length > 0 && DataTypes.UnicodeString.indexOf(column.data_type.toLowerCase()) >= 0)
    ?  column.max_length / 2
    : column.max_length

  return new PropertyTypes.StringPropertyType(
    maxLength === -1 ? null : maxLength,
    null, // allowedValues
    undefined, // caseSensitive
    column.is_nullable,
    column.is_primary_key,
    parseDefaultDefinition(column.default_definition)
  )
}

function createUniqueIdentifierPropertyType(column: IMsSqlColumnModel) {
  return new PropertyTypes.UniqueIdentifierPropertyType(
    column.is_nullable,
    column.is_primary_key,
    column.default_definition !== null
  )
}

function parseBooleanDefaultDefinition(defaultDefinition: string | null) {
  const result = parseDefaultDefinition(defaultDefinition)
  return result === '1' ? true : false
}

function parseDateTimeDefaultDefinition(defaultDefinition: string | null) {
  const result = parseDefaultDefinition(defaultDefinition)

  const nowDefaults = [
    'getdate()',
    'getutcdate()',
    'sysdatetime()',
    'sysutcdatetime()'
  ]

  return result && nowDefaults.indexOf(result.toLowerCase()) >= 0 ? 'NOW' : result
}

function parseDefaultDefinition(defaultDefinition: string | null) {
  if (!defaultDefinition) {
    return defaultDefinition
  }

  let result = defaultDefinition
  const re = /^\((.+)\)$/
  while (re.test(result)) {
    result = result.replace(re, '$1')
  }
  return result
}
