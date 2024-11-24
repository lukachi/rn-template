process.env.APP_ENV = process.env.APP_ENV || 'development'

const fs = require('fs')
const path = require('path')
const dotenv = require('dotenv')
const { execSync } = require('child_process')

const envFiles = ['.env.secrets.development', '.env.secrets.staging', '.env.secrets.production']

const outputFilePath = '.env.secrets'
let combinedEnv = {}

envFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const envConfig = dotenv.parse(fs.readFileSync(file))
    const envPrefix = path.basename(file).split('.')[3].toUpperCase()

    console.log(`Loaded ${file} with prefix ${envPrefix}`)

    Object.keys(envConfig).forEach(key => {
      combinedEnv[`${envPrefix}_${key}`] = envConfig[key]
    })
  }
})

const outputContent = Object.entries(combinedEnv)
  .map(([key, value]) => `${key}=${value}`)
  .join('\n')

fs.writeFileSync(outputFilePath, outputContent)

try {
  execSync('eas secret:push --scope project --env-file .env.secrets --force --non-interactive', {
    stdio: 'inherit',
  })
} catch (error) {
  console.error('Failed to push secrets:', error)
}

fs.unlinkSync(outputFilePath)
console.log(`Deleted ${outputFilePath}`)
