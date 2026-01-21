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

  APP_ENV: z.enum(['development', 'staging', 'regtest', 'production']),
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

/**
 * Calculate Android versionCode from semver + environment
 * Format: M_NN_PP_XXYY (9 digits max)
 *   M    = major (0-9)
 *   NN   = minor (00-99)
 *   PP   = patch (00-99)
 *   XXYY = env code derived from first 2 letters (a=01, b=02, ...z=26)
 *
 * Env code is self-derived — no manual mapping needed:
 *   staging     → ST → 19,20 → 1920
 *   regtest     → RE → 18,05 → 1805
 *   production  → PR → 16,18 → 1618
 *   development → DE → 04,05 → 0405
 *   (any new env automatically gets unique code)
 *
 * Examples:
 *   0.1.0-staging → 0|01|00|1920 → 1001920
 *   1.2.3-regtest → 1|02|03|1805 → 102031805
 */
function getVersionCode(version: string, env: string): number {
  const [major, minor, patch] = version.split('.').map(Number)

  // Derive env code from first 2 letters (no manual mapping needed)
  const [first, second] = [...env.toLowerCase().slice(0, 2)].map(char => char.charCodeAt(0) - 96) // a=1, b=2, ...z=26

  const envCode = first * 100 + second

  // Format: M_NN_PP_XXYY
  return major * 1_0000_0000 + minor * 100_0000 + patch * 1_0000 + envCode
}

/**
 * Get build number / version name with environment suffix
 * Production: "1.0.0"
 * Others: "1.0.0-staging", "1.0.0-regtest"
 */
function getBuildNumber(version: string, env: string): string {
  return env === 'production' ? version : `${version}-${env}`
}

export { Env, ClientEnv, getVersionCode, getBuildNumber }
