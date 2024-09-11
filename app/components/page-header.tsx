import { Helmet } from 'react-helmet-async'
import { htmlTitle } from '~shared/identity'

export function PageHeader({ title }: { title: string }) {
  return (
    <Helmet>
      <title>
        {title} - {htmlTitle}
      </title>
    </Helmet>
  )
}
