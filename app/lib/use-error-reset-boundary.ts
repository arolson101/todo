import { useQueryErrorResetBoundary } from '@tanstack/react-query'
import { useEffect } from 'react'

export default function useErrorResetBoundary() {
  const queryErrorResetBoundary = useQueryErrorResetBoundary()
  useEffect(() => {
    // Reset the query error boundary
    queryErrorResetBoundary.reset()
  }, [queryErrorResetBoundary])
}
