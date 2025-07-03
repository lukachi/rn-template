/*
 * Env file to load and validate env variables
 * Be cautious; this file should not be imported into your source folder.
 * We split the env variables into two parts:
 * 1. Client variables: These variables are used in the client-side code (src folder).
 * 2. Build-time variables: These variables are used in the build process (app.config.ts file).
 * Import this file into the `app.config.ts` file to use environment variables during the build process. The client variables can then be passed to the client-side using the extra field in the `app.config.ts` file.
 * To access the client environment variables in your `src` folder, you can import them from `@env`. For example: `import Env from '@env'`.
 */
/**
 * 1st part: Import packages and Load your env variables
 * we use dotenv to load the correct variables from the .env file based on the APP_ENV variable (default is development)
 * APP_ENV is passed as an inline variable while executing the command, for example: APP_ENV=staging yarn build:android
 */
const z = require('zod')

const packageJSON = require('./package.json')
const path = require('path')
const APP_ENV = process.env.APP_ENV ?? 'development'
const envPath = path.resolve(__dirname, `.env.${APP_ENV}`)
const secretEnvPath = path.resolve(__dirname, `.env.secrets.${APP_ENV}`)

require('dotenv').config({
  path: [envPath, secretEnvPath],
})

/**
 * 2nd part: Define some static variables for the app
 * Such as: bundle id, package name, app name.
 *
 * You can add them to the .env file but we think it's better to keep them here as as we use prefix to generate this values based on the APP_ENV
 * for example: if the APP_ENV is staging, the bundle id will be com.obytes.staging
 */

// TODO: Replace these values with your own

const BUNDLE_ID = 'com.lukachi.template' // ios bundle id
const PACKAGE = 'com.lukachi.template' // android package name
const NAME = 'lukachi-template' // app name
const EXPO_ACCOUNT_OWNER = 'lukachi' // expo account owner
const EAS_PROJECT_ID = '40c83c51-180e-486a-bb1e-290cd69e8fe3' // eas project id
const SCHEME = 'lukachiTemplateApp' // app scheme

/**
 * We declare a function withEnvSuffix that will add a suffix to the variable name based on the APP_ENV
 * Add a suffix to variable env based on APP_ENV
 * @param {string} name
 * @returns  {string}
 */

const withEnvSuffix = name => {
  return APP_ENV === 'production' ? name : `${name}.${APP_ENV}`
}

const getSecretWithSuffix = name => {
  const appEnvUppercase = APP_ENV.toUpperCase()

  return process.env[`${appEnvUppercase}_${name}`] || process.env[name]
}

/**
 * 2nd part: Define your env variables schema
 * we use zod to define our env variables schema
 *
 * we split the env variables into two parts:
 *    1. client: These variables are used in the client-side code (`src` folder).
 *    2. buildTime: These variables are used in the build process (app.config.ts file). You can think of them as server-side variables.
 *
 * Main rules:
 *    1. If you need your variable on the client-side, you should add it to the client schema; otherwise, you should add it to the buildTime schema.
 *    2. Whenever you want to add a new variable, you should add it to the correct schema based on the previous rule, then you should add it to the corresponding object (_clientEnv or _buildTimeEnv).
 *
 * Note: `z.string()` means that the variable exists and can be an empty string, but not `undefined`.
 * If you want to make the variable required, you should use `z.string().min(1)` instead.
 * Read more about zod here: https://zod.dev/?id=strings
 *
 */

const client = z.object({
  APP_ENV: z.enum(['development', 'staging', 'production']),
  NAME: z.string(),
  SCHEME: z.string(),
  BUNDLE_ID: z.string(),
  PACKAGE: z.string(),
  VERSION: z.string(),

  // ADD YOUR CLIENT ENV VARS HERE
  RELAYER_API_URL: z.string().url(),

  RMO_CHAIN_ID: z.string(),

  REGISTRATION_CONTRACT_ADDRESS: z.string(),
  STATE_KEEPER_CONTRACT_ADDRESS: z.string(),

  CERT_POSEIDON_SMT_CONTRACT_ADDRESS: z.string(),
  REGISTRATION_POSEIDON_SMT_CONTRACT_ADDRESS: z.string(),

  ICAO_COSMOS_GRPC: z.string(),
  MASTER_CERTIFICATES_BUCKETNAME: z.string(),
  MASTER_CERTIFICATES_FILENAME: z.string(),

  POINTS_SVC_ID: z.string(),

  SOME_SECRET_KEY: z.string(),

  PASSPORT_1: z.string(),
  PASSPORT_2: z.string(),
  PASSPORT_3: z.string(),
})

const buildTime = z.object({
  EXPO_ACCOUNT_OWNER: z.string(),
  EAS_PROJECT_ID: z.string(),
  // ADD YOUR BUILD TIME ENV VARS HERE
})

/**
 * @type {Record<keyof z.infer<typeof client> , unknown>}
 */
const _clientEnv = {
  APP_ENV,
  NAME: NAME,
  SCHEME: SCHEME,
  BUNDLE_ID: withEnvSuffix(BUNDLE_ID),
  PACKAGE: withEnvSuffix(PACKAGE),
  VERSION: packageJSON.version,

  // ADD YOUR ENV VARS HERE TOO
  RELAYER_API_URL: process.env.EXPO_PUBLIC_RELAYER_API_URL,

  RMO_CHAIN_ID: process.env.EXPO_PUBLIC_RMO_CHAIN_ID,

  REGISTRATION_CONTRACT_ADDRESS: process.env.EXPO_PUBLIC_REGISTRATION_CONTRACT_ADDRESS,
  STATE_KEEPER_CONTRACT_ADDRESS: process.env.EXPO_PUBLIC_STATE_KEEPER_CONTRACT_ADDRESS,

  CERT_POSEIDON_SMT_CONTRACT_ADDRESS: process.env.EXPO_PUBLIC_CERT_POSEIDON_SMT_CONTRACT_ADDRESS,
  REGISTRATION_POSEIDON_SMT_CONTRACT_ADDRESS:
    process.env.EXPO_PUBLIC_REGISTRATION_POSEIDON_SMT_CONTRACT_ADDRESS,

  ICAO_COSMOS_GRPC: process.env.EXPO_PUBLIC_ICAO_COSMOS_GRPC,
  MASTER_CERTIFICATES_BUCKETNAME: process.env.EXPO_PUBLIC_MASTER_CERTIFICATES_BUCKETNAME,
  MASTER_CERTIFICATES_FILENAME: process.env.EXPO_PUBLIC_MASTER_CERTIFICATES_FILENAME,

  POINTS_SVC_ID: process.env.EXPO_PUBLIC_POINTS_SVC_ID,

  SOME_SECRET_KEY: getSecretWithSuffix('SOME_SECRET_KEY'),

  PASSPORT_1: getSecretWithSuffix('PASSPORT_1'),
  PASSPORT_2: getSecretWithSuffix('PASSPORT_2'),
  PASSPORT_3: getSecretWithSuffix('PASSPORT_3'),
}

/**
 * @type {Record<keyof z.infer<typeof buildTime> , unknown>}
 */
const _buildTimeEnv = {
  EXPO_ACCOUNT_OWNER,
  EAS_PROJECT_ID,
  // ADD YOUR ENV VARS HERE TOO
  // SECRET_KEY: process.env.EXPO_PUBLIC_SECRET_KEY,
}

/**
 * 3rd part: Merge and Validate your env variables
 * We use zod to validate our env variables based on the schema we defined above
 * If the validation fails we throw an error and log the error to the console with a detailed message about missed variables
 * If the validation passes we export the merged and parsed env variables to be used in the app.config.ts file as well as a ClientEnv object to be used in the client-side code
 **/
const _env = {
  ..._clientEnv,
  ..._buildTimeEnv,
}

const merged = buildTime.merge(client)
const parsed = merged.safeParse(_env)

if (parsed.success === false) {
  console.error(
    '❌ Invalid environment variables:',
    parsed.error.flatten().fieldErrors,

    `\n❌ Missing variables in .env.${APP_ENV} file, Make sure all required variables are defined in the .env.${APP_ENV} file.`,
    `\n💡 Tip: If you recently updated the .env.${APP_ENV} file and the error still persists, try restarting the server with the -cc flag to clear the cache.`,
  )
  throw new Error('Invalid environment variables, Check terminal for more details ')
}

const Env = parsed.data
const ClientEnv = client.parse(_clientEnv)

module.exports = {
  Env,
  ClientEnv,
  withEnvSuffix,
}
