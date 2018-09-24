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
