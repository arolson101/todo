import { type BuildQueryResult, type DBQueryConfig, type ExtractTablesWithRelations, sql } from 'drizzle-orm'
import { integer, type SQLiteColumn, sqliteTableCreator, type SQLiteTableFn, text } from 'drizzle-orm/sqlite-core'
import * as schema from '~server/db/schema'

export const createTable: SQLiteTableFn = sqliteTableCreator(name => name)

// https://orm.drizzle.team/docs/column-types/sqlite
export const _idNum = <T>(col: string) =>
  integer(col, { mode: 'number' }).primaryKey({ autoIncrement: true }).$type<T>()
export const _idUUID = <T>(col: string) =>
  text(col)
    .primaryKey()
    .$type<T>()
    .$defaultFn(() => crypto.randomUUID() as T)
export const _int = (col: string) => integer(col).notNull().default(0)
export const _text = (col: string) => text(col).notNull().default('')
export const _bool = (col: string, dflt: boolean) => integer(col, { mode: 'boolean' }).notNull().default(dflt)
// export const _enum = <TName extends string, U extends string, T extends Readonly<[U, ...U[]]>>(col: TName, enm: (x: TName) => PgTextBuilderInitial<TName, Writable<T>>) => enm(col).notNull()
export const _decimal = (col: string) => integer(col, { mode: 'number' }).notNull().default(0)
export const _timestamp = (col: string) =>
  integer(col, { mode: 'timestamp' })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`)
export const _refidNum = <T>(col: string, ref: () => SQLiteColumn) =>
  integer(col).notNull().references(ref, { onDelete: 'cascade' }).$type<T>()
export const _refidUUID = <T>(col: string, ref: () => SQLiteColumn) =>
  text(col).notNull().references(ref, { onDelete: 'cascade' }).$type<T>()

type Schema = typeof schema
type TSchema = ExtractTablesWithRelations<Schema>

export type IncludeRelation<TableName extends keyof TSchema> = DBQueryConfig<
  'one' | 'many',
  boolean,
  TSchema,
  TSchema[TableName]
>['with']

export type InferResultType<
  TableName extends keyof TSchema,
  With extends IncludeRelation<TableName> | undefined = undefined,
> = BuildQueryResult<
  TSchema,
  TSchema[TableName],
  {
    with: With
  }
>
