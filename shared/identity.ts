import app from '../app.json'

export const appName = app.name
export const appDisplayName = app.displayName

/**
 * Prefix of table names
 * It’s very useful when you need to keep schemas of different projects in one database.
 * https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const dbTablePrefix = `${appName}_`
export const dbFileName = `${appName}_db.db`

/**
 * Application logo
 * (in public folder)
 * Shown on login page, etc
 */
export const appLogoImgProps = (width: number) => {
  const [w, h] = [71, 55]
  return {
    src: 'logoipsum-331.svg',
    width,
    height: (width * h) / w,
  }
}
