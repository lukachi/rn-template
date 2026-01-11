import z from 'zod'

import packageJSON from './package.json' with { type: 'json' }
import path from 'path'

import dotenv from 'dotenv'

const __dirname = path.resolve()

const APP_ENV = process.env.APP_ENV ?? 'development'

dotenv.config({
  path: [
    path.resolve(__dirname, `.env.${APP_ENV}`),
    path.resolve(__dirname, `.env.secrets.${APP_ENV}`),
  ],
})

const client = z.object({
  VERSION: z.string().default(packageJSON.version),

  APP_ENV: z.enum(['development', 'staging', 'production']),
  API_URL: z.url(),
})

const buildTime = z.object({
  BUNDLE_ID: z.string().default('com.lukachi.templateapp'), // ios bundle id
  PACKAGE: z.string().default('com.lukachi.templateapp'), // android package name
  NAME: z.string().default('Template App'), // app name
  SLUG: z.string().default('template-app'), // app slug
  EXPO_ACCOUNT_OWNER: z.string().default('dl-expo'), // expo account owner
  EAS_PROJECT_ID: z.string().default(''), // eas project id
  SCHEME: z.string().default('templateapp'), // app scheme
})

const parsed = buildTime.and(client).safeParse(process.env)

if (parsed.success === false) {
  console.error(
    '❌ Invalid environment variables:',
    z.treeifyError(parsed.error).properties,

    `\n❌ Missing variables in .env.${APP_ENV} file, Make sure all required variables are defined in the .env.${APP_ENV} file.`,
    `\n💡 Tip: If you recently updated the .env.${APP_ENV} file and the error still persists, try restarting the server with the -cc flag to clear the cache.`,
  )
  process.exit(1)
}

const Env = parsed.data
const ClientEnv = client.parse(process.env)

export { Env, ClientEnv }
