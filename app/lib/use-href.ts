import { useLocation } from '@tanstack/react-router'

export const useHref = () =>
  useLocation({
    select: (location) => location.href,
  })
