import { faker } from '@faker-js/faker'
import { conn, db } from '~server/db/db'
import { todos, users } from '~server/db/schema'

async function main() {
  console.log('Seeding database...')

  await db.transaction(async (_tx) => {
    // eslint-disable-next-line drizzle/enforce-delete-with-where
    await db.delete(users)
    // eslint-disable-next-line drizzle/enforce-delete-with-where
    await db.delete(todos)

    const createdUser = await db
      .insert(users)
      .values({
        name: faker.person.fullName(),
      })
      .returning()

    await db.insert(todos).values([
      {
        userId: createdUser[0].id,
        text: 'First todo',
        completed: true,
      },
      {
        userId: createdUser[0].id,
        text: 'Second todo',
        completed: true,
      },
      {
        userId: createdUser[0].id,
        text: 'Third todo',
        completed: false,
      },
    ])
  })
  await conn.end()
}

await main()
