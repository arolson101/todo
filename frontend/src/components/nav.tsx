import { Link } from '@tanstack/react-router'

export const Nav = () => {
  return (
    <>
      <div className='p-2 flex gap-2'>
        <Link to='/' className='[&.active]:font-bold'>
          Home
        </Link>{' '}
        <Link to='/about' className='[&.active]:font-bold'>
          About
        </Link>
        <Link to='/todos' className='[&.active]:font-bold'>
          Todos
        </Link>
      </div>
    </>
  )
}
