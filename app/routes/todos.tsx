import { zodResolver } from '@hookform/resolvers/zod'
import { createFileRoute } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { PageHeader } from '~/components/page-header'
import { Button } from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'
import { Form, FormControl, FormField, FormItem } from '~/components/ui/form'
import { Input } from '~/components/ui/input'
import { api } from '~/lib/trpc'
import type { Todo } from '~shared/types'

export const Route = createFileRoute('/todos')({
  // beforeLoad({ context: { sessionRef } }) {
  //   if (sessionRef.current.status === 'unauthenticated') {
  //     throw redirect({ to: '/signin', search: { error: true, redirect: window.location.href } })
  //   }
  // },
  // loader: ({ context }) => context.trpc.todo.all.query(),
  component: TodosPage,
})

const formSchema = z.object({
  text: z.string().trim(),
})

function TodosPage() {
  const { data: todos, refetch } = api.todo.all.useQuery()
  const { mutate: addTodo } = api.todo.create.useMutation()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: '',
    },
  })

  async function onSubmit({ text }: z.infer<typeof formSchema>) {
    await addTodo({ text })
    form.reset()
    await refetch()
  }

  return (
    <>
      <PageHeader title='Todos' />

      <div className='p-2'>
        <p>Todos:</p>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
            <div className='flex flex-row items-center'>
              <FormField
                control={form.control}
                name='text'
                render={({ field }) => (
                  <FormItem className='max-w-96 grow'>
                    <FormControl>
                      <Input placeholder='make a todo item' {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type='submit'>Add</Button>
            </div>
          </form>
        </Form>
        <ul>{todos?.map((todo) => <TodoItem key={todo.id} todo={todo} refetch={refetch} />)}</ul>
      </div>
    </>
  )
}

function TodoItem({ todo, refetch }: { todo: Todo; refetch: () => any }) {
  const { mutate: setCompleted } = api.todo.setCompleted.useMutation()
  const { mutate: setDeleted } = api.todo.remove.useMutation()

  async function setChecked(completed: boolean) {
    await setCompleted({ id: todo.id, completed })
    refetch()
  }

  async function remove() {
    await setDeleted(todo.id)
    refetch()
  }

  return (
    <li className='flex items-center gap-2'>
      <Checkbox checked={todo.completed} onCheckedChange={setChecked} />
      {todo.text}
      <Button variant='link' onClick={remove}>
        X
      </Button>
    </li>
  )
}
