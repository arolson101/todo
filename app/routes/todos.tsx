import { zodResolver } from '@hookform/resolvers/zod'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { PageHeader } from '~/components/page-header'
import { Button } from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'
import { Form, FormControl, FormField, FormItem } from '~/components/ui/form'
import { Input } from '~/components/ui/input'
import { Todo } from '~/db/types'
import { api } from '~/lib/trpc'
import { storage } from '~/services/storage'

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
  title: z.string().trim(),
})

function TodosPage() {
  const todos = storage.todo.all.useLiveQuery()
  const addTodo = storage.todo.create.useMutation()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
    },
  })

  async function onSubmit({ title }: z.infer<typeof formSchema>) {
    await addTodo.mutateAsync(title)
    form.reset()
  }

  const [test, setTest] = useState(-1)

  api.changes.stream.useSubscription(undefined, {
    onData(data) {
      setTest(data)
    },
  })

  return (
    <>
      <PageHeader title='Todos' />

      <div className='p-2'>
        <p>Todos:</p>
        <p>Random number: {test}</p>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
            <div className='flex flex-row items-center'>
              <FormField
                control={form.control}
                name='title'
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
        <ul>{todos?.map((todo) => <TodoItem key={todo.id} todo={todo} />)}</ul>
      </div>
    </>
  )
}

function TodoItem({ todo }: { todo: Todo }) {
  const setCompleted = storage.todo.setCompleted.useMutation()
  const setDeleted = storage.todo.remove.useMutation()

  async function onCompletedChange(completed: boolean) {
    setCompleted.mutateAsync({ id: todo.id, completed })
  }

  async function onRemoveClick() {
    setDeleted.mutateAsync(todo.id)
  }

  return (
    <li className='flex items-center gap-2'>
      <Checkbox checked={todo.completed} onCheckedChange={onCompletedChange} disabled={setCompleted.isPending} />
      {todo.title}
      <Button variant='link' onClick={onRemoveClick} disabled={setDeleted.isPending}>
        X
      </Button>
    </li>
  )
}
