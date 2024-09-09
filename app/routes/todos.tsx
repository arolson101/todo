import { zodResolver } from '@hookform/resolvers/zod'
import { createFileRoute } from '@tanstack/react-router'
import { useLiveQuery } from 'dexie-react-hooks'
import { nanoid } from 'nanoid'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'
import { Form, FormControl, FormField, FormItem } from '~/components/ui/form'
import { Input } from '~/components/ui/input'
import { db, Todo } from '~/db/dexie'

export const Route = createFileRoute('/todos')({
  // beforeLoad({ context: { session } }) {
  //   if (session.status !== 'authenticated') {
  //     throw redirect({ to: '/signin', search: { error: true, redirect: window.location.href } })
  //   }
  // },
  component: TodosPage,
})

const formSchema = z.object({
  text: z.string().trim(),
})

function TodosPage() {
  const todos = useLiveQuery(() => db.todos.where({ _deleted: 0 }).toArray())

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: '',
    },
  })

  function onSubmit({ text }: z.infer<typeof formSchema>) {
    db.todos.add({
      _deleted: 0,
      _guid: nanoid(),
      text,
      completed: false,
    })
    form.reset()
  }

  return (
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
      <ul>{todos?.map((todo) => <TodoItem key={todo._id} todo={todo} />)}</ul>
    </div>
  )
}

function TodoItem({ todo }: { todo: Todo }) {
  function setChecked(completed: boolean) {
    db.todos.update(todo._id, { completed })
  }

  function remove() {
    db.todos.update(todo._id, { _deleted: 1 })
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
