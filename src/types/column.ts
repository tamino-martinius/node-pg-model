export enum DataType {
  // Number
  Int2 = 'INT2',
  Int4 = 'INT4',
  Int8 = 'INT8',
  SmallInteger = 'INT2',
  Integer = 'INT4',
  BigInteger = 'INT8',
  Float4 = 'FLOAT4',
  Float8 = 'FLOAT8',
  Real = 'FLOAT4',
  Double = 'FLOAT8',
  Decimal = 'DECIMAL($precision, $scale)',
  Numeric = 'DECIMAL($precision, $scale)',
  Money = 'MONEY',

  // Identifier
  Uuid = 'UUID',
  Serial2 = 'SERIAL2',
  Serial4 = 'SERIAL4',
  Serial8 = 'SERIAL8',
  SmallSerial = 'SERIAL2',
  Serial = 'SERIAL4',
  BigSerial = 'SERIAL8',

  // Binary
  Boolean = 'BOOLEAN',
  Bit = 'BIT($length)',
  BitVarying = 'VARBIT($length)',
  ByteArray = 'BYTEA',

  // String
  Char = 'CHAR($length)',
  CharVarying = 'VARCHAR($length)',
  Text = 'TEXT',

  // Date
  Date = 'DATE',
  Time = 'TIME($precision)',
  TimeWithZone = 'TIMEZ($precision)',
  Timestamp = 'TIMESTAMP($precision)',
  TimestampWithZone = 'TIMESTAMPZ($precision)',
  Interval = 'INTERVAL',

  // Data
  Json = 'JSON',
  JsonBinary = 'JSONB',
  Xml = 'XML',

  // Graphical
  Box = 'BOX',
  Circle = 'CIRCLE',
  Path = 'PATH',
  Point = 'POINT',
  Polygon = 'POLYGON',
  Line = 'LINE',
  LineSegment = 'LSEG',

  // Address
  HostAddress = 'INET',
  NetworkAddress = 'CIDR',
  MacAddress = 'MACADDR',

  // Special
  TextSearchQuery = 'TSQUERY',
  TextSearchVector = 'TSVECTOR',
  TransactionIdSnapshot = 'TXID_SNAPSHOT',
  LogSequenceNumber = 'PG_LSN',
}

// Base
export type Column =
  ColumnNumber |
  ColumnIdentifier |
  ColumnBinary |
  ColumnString |
  ColumnDate |
  ColumnData |
  ColumnGraphical |
  ColumnAddress;

export interface ColumnBase {
  type: string;
  indexed?: boolean;
}

export interface ColumnWithDefault<T> extends ColumnBase {
  default?: T;
}

export interface ColumnWithPrecision extends ColumnBase {
  precision?: Number;
}

export interface ColumnWithScale extends ColumnWithPrecision {
  scale?: Number;
}

export interface ColumnWithLength extends ColumnBase {
  length?: Number;
}

// Number
export type ColumnNumber = ColumnNumberSimple | ColumnNumberWithScale;

export type IntTypes = 'Int2' | 'Int4' | 'Int8' | 'SmallInteger' | 'Integer' | 'BigInteger';
export type FloatTypes = 'Float4' | 'Float8' | 'Real' | 'Double' | 'Money';

export interface ColumnNumberSimple extends ColumnWithDefault<Number> {
  type: IntTypes | FloatTypes;
}

export interface ColumnNumberWithScale extends ColumnWithDefault<Number>, ColumnWithScale {
  type: 'Decimal' | 'Numeric';
}

// Identifier
export interface ColumnIdentifier extends ColumnBase {
  type: 'Uuid' | 'Serial2' | 'Serial4' | 'Serial8' | 'SmallSerial' | 'Serial' | 'BigSerial';
}

// Binary
export type ColumnBinary = ColumnBoolean | ColumnBit | ColumnByteArray;

export interface ColumnBoolean extends ColumnWithDefault<Boolean> {
  type: 'Boolean';
}

export interface ColumnBit extends ColumnWithLength {
  type: 'Bit' | 'BitVarying';
}

export interface ColumnByteArray extends ColumnBase {
  type: 'ByteArray';
}

// String
export type ColumnString = ColumnChar | ColumnText;

export interface ColumnChar extends ColumnWithLength {
  type: 'Char' | 'CharVarying';
}

export interface ColumnText extends ColumnBase {
  type: 'Text';
}

// Date
export type ColumnDate = ColumnDateSimple | ColumnDateWithPrecission;

export interface ColumnDateSimple extends ColumnBase {
  type: 'Date';
}

export interface ColumnDateWithPrecission extends ColumnWithPrecision {
  type: 'Time' | 'TimeWithZone' | 'Timestamp' | 'TimestampWithZone';
}

// Data
export interface ColumnData extends ColumnBase {
  type: 'Json' | 'JsonBinary' | 'Xml';
}

// Graphical
export interface ColumnGraphical extends ColumnBase {
  type: 'Box' | 'Circle' | 'Path' | 'Point' | 'Polygon' | 'Line' | 'LineSegment';
}

// Address
export interface ColumnAddress extends ColumnBase {
  type: 'HostAddress' | 'NetworkAddress' | 'MacAddress';
}
