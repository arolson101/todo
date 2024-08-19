import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { z } from 'zod'

export const PostId = z.string().trim().min(1).max(64).brand('post_id')
export type PostId = z.infer<typeof PostId>

export const Post = z.object({
  id: PostId,
  title: z.string().trim().min(3).max(100),
  body: z.string(),
})
export type Post = z.infer<typeof Post>

const makeId = (n: number): PostId => PostId.parse(`${n}`)

const posts: Post[] = [
  {
    id: makeId(1),
    title: 'First Article',
    body: 'first article text',
  },
  {
    id: makeId(2),
    title: 'Second Article',
    body: 'second article text',
  },
]

const createPostSchema = Post.omit({ id: true })

export const postsRoute = new Hono()
  .get('/', (c) => {
    return c.json({ posts })
  })
  .post('/', zValidator('json', createPostSchema), (c) => {
    const post = c.req.valid('json')
    posts.push({ ...post, id: makeId(posts.length + 1) })
    c.status(201)
    return c.json({ post: posts[posts.length - 1] })
  })
  .get('/:id', (c) => {
    const id = c.req.param('id')
    const post = posts.find((p) => p.id === id)
    if (!post) {
      return c.notFound()
    }
    return c.json({ post })
  })
