import type { BuildQueryResult, DBQueryConfig, ExtractTablesWithRelations } from 'drizzle-orm'
import {
  boolean,
  decimal,
  integer,
  type PgColumn,
  pgTableCreator,
  type PgTableFn,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'
import * as schema from '@server/db/schema'

export const createTable: PgTableFn = pgTableCreator((name) => `todo_${name}`)

export const _id = <T>(col: string) => serial(col).primaryKey().$type<T>()
export const _int = (col: string) => integer(col).notNull().default(0)
export const _text = (col: string) => text(col).notNull().default('')
export const _bool = (col: string, dflt: boolean) => boolean(col).notNull().default(dflt)
// export const _enum = <TName extends string, U extends string, T extends Readonly<[U, ...U[]]>>(col: TName, enm: (x: TName) => PgTextBuilderInitial<TName, Writable<T>>) => enm(col).notNull()
export const _decimal = (col: string) => decimal(col).notNull().default(`0`)
export const _timestamp = (col: string) => timestamp(col).notNull().defaultNow()
export const _refid = <T>(col: string, ref: () => PgColumn) =>
  integer(col).notNull().references(ref, { onDelete: 'cascade' }).$type<T>()

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
