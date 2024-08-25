export const appName = 'todo'
export const appDisplayName = 'Todo App'

/**
 * Prefix of table names
 * It’s very useful when you need to keep schemas of different projects in one database.
 * https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const dbTablePrefix = `${appName}_`

/**
 * Application logo
 * (in public folder)
 * Shown on login page, etc
 */
export const AppLogo = ({ className, width }: { className?: string; width: number }) => {
  const [w, h] = [71, 55]
  return <img src='logoipsum-331.svg' width={width} height={(width * h) / w} className={className} />
}
