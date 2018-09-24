export interface Dict<T> {
  [key: string]: T;
}
export type Tuple<T, U> = [T, U];

export interface Range<T> {
  from: T;
  to: T;
}

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
  type: DataType;
  name: string;
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

export interface ColumnNumberSimple extends ColumnWithDefault<Number> {
  type:
  DataType.Int2 |
  DataType.Int4 |
  DataType.Int8 |
  DataType.SmallInteger |
  DataType.Integer |
  DataType.BigInteger |
  DataType.Float4 |
  DataType.Float8 |
  DataType.Real |
  DataType.Double |
  DataType.Money;
}

export interface ColumnNumberWithScale extends ColumnWithDefault<Number>, ColumnWithScale {
  type: DataType.Decimal | DataType.Numeric;
}

// Identifier
export interface ColumnIdentifier extends ColumnBase {
  type:
  DataType.Uuid |
  DataType.Serial2 |
  DataType.Serial4 |
  DataType.Serial8 |
  DataType.SmallSerial |
  DataType.Serial |
  DataType.BigSerial;
}

// Binary
export type ColumnBinary = ColumnBoolean | ColumnBit | ColumnByteArray;

export interface ColumnBoolean extends ColumnWithDefault<Boolean> {
  type: DataType.Boolean;
}

export interface ColumnBit extends ColumnWithLength {
  type: DataType.Bit | DataType.BitVarying;
}

export interface ColumnByteArray extends ColumnBase {
  type: DataType.ByteArray;
}

// String
export type ColumnString = ColumnChar | ColumnText;

export interface ColumnChar extends ColumnWithLength {
  type: DataType.Char | DataType.CharVarying;
}

export interface ColumnText extends ColumnBase {
  type: DataType.Text;
}

// Date
export type ColumnDate = ColumnDateSimple | ColumnDateWithPrecission;

export interface ColumnDateSimple extends ColumnBase {
  type: DataType.Date;
}

export interface ColumnDateWithPrecission extends ColumnWithPrecision {
  type: DataType.Time | DataType.TimeWithZone | DataType.Timestamp | DataType.TimestampWithZone;
}

// Data
export interface ColumnData extends ColumnBase {
  type: DataType.Json | DataType.JsonBinary | DataType.Xml;
}

// Graphical
export interface ColumnGraphical extends ColumnBase {
  type:
  DataType.Box |
  DataType.Circle |
  DataType.Path |
  DataType.Point |
  DataType.Polygon |
  DataType.Line |
  DataType.LineSegment;
}

// Address
export interface ColumnAddress extends ColumnBase {
  type: DataType.HostAddress | DataType.NetworkAddress | DataType.MacAddress;
}
