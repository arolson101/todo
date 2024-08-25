import { appLogoImgProps } from '~shared/identity'

export const AppLogo = ({ className, width }: { className?: string; width: number }) => {
  return <img {...appLogoImgProps(width)} className={className} />
}
