import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <h1 className='text-3xl font-bold underline'>Hello world!</h1>
      <button onClick={() => setCount(count - 1)}>-</button> {count}{' '}
      <button onClick={() => setCount(count + 1)}>+</button>
    </>
  )
}

export default App
