import { zodResolver } from '@hookform/resolvers/zod'
import { createFileRoute } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { PageHeader } from '~/components/page-header'
import { Button } from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'
import { Form, FormControl, FormField, FormItem } from '~/components/ui/form'
import { Input } from '~/components/ui/input'
import { Todo } from '~/db/types'
import { useAppStore, useAppStoreY, useY } from '~/store'
import { YTodo } from '~/store/slices/todo-list-slice'

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
  const todoIds = useAppStoreY(state => state.currentList.items)
  const todos = useAppStore(state => state.currentList.todos)
  const createTodo = useAppStore(state => state.createTodo)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    await createTodo(values)
    form.reset()
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
        <ul>{todoIds?.map(todoId => <TodoItem key={todoId} todo={todos[todoId]} />)}</ul>
      </div>
    </>
  )
}

function TodoItem({ todo }: { todo: YTodo }) {
  if (!todo) {
    return null
  }
  const setTodoCompleted = useAppStore(s => s.setTodoCompleted)
  const removeTodo = useAppStore(s => s.removeTodo)
  const title = useY(todo.title)

  return (
    <li className='flex items-center gap-2'>
      <Checkbox
        checked={todo.completed}
        onCheckedChange={(completed: boolean) => {
          setTodoCompleted(todo.id, completed)
        }}
      />
      {title}
      <Button
        variant='link'
        onClick={() => {
          removeTodo(todo.id)
        }}
      >
        X
      </Button>
    </li>
  )
}
