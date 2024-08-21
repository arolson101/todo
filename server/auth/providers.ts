import type { Provider } from '@auth/core/providers'
import Credentials from '@auth/core/providers/credentials'
import Passkey from '@auth/core/providers/passkey'
import { db } from '@server/db/db'
import { credentialsSchema } from '@shared/models/credentials'

export const providers: Provider[] = [
  Passkey({ name: 'foo' }),
  Credentials({
    // You can specify which fields should be submitted, by adding keys to the `credentials` object.
    // e.g. domain, username, password, 2FA token, etc.
    credentials: {
      email: {},
      password: {},
    },
    authorize: async (credentials) => {
      const { email, password } = credentialsSchema.parse(credentials)

      const user = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.email, email),
      })

      if (!user) {
        // No user found, so this is their first attempt to login
        // meaning this is also the place you could do registration
        throw new Error('User not found.')
      }

      const verified = await Bun.password.verify(password, user.passwordHash ?? '')
      if (!verified) {
        throw new Error('Wrong password.')
      }

      // return user object with their profile data
      return user
    },
  }),
]
