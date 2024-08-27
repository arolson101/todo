import {
  createBrowserRouter as createRouter,
  Link,
  Outlet,
  redirect,
  RouteObject,
  RouterProvider,
  useNavigate,
  useLoaderData as useRRLoaderData,
  useSearchParams as useRRSearchParams,
} from 'react-router-dom'
import { z } from 'zod'

export function makeRoute<TPath extends string, TSearch extends z.SomeZodObject, TData extends {}>(params: {
  index?: true
  path?: TPath
  search?: TSearch
  Component?: React.ComponentType<{ search: z.infer<TSearch> }>
  children?: RouteObject[]
  loader?: () => Promise<TData> | TData
}) {
  const useSearchParams = () => {
    const [searchParamsObj] = useRRSearchParams()
    const searchParams = params.search?.parse(Object.fromEntries(searchParamsObj)) as z.infer<TSearch>
    return searchParams
  }
  const useLoaderData = useRRLoaderData as () => TData
  return { ...(params as RouteObject), useSearchParams, useLoaderData }
}

export { createRouter, Link, RouterProvider, Outlet, redirect, useNavigate }
