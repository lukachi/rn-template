const { withProjectBuildGradle, withAppBuildGradle } = require('@expo/config-plugins')

// This function will modify the root project build.gradle file
const withCustomRootBuildGradle = config => {
  return withProjectBuildGradle(config, config => {
    const buildGradle = config.modResults.contents
    // Add flatDir for multiple local modules
    const flatDirSnippet = `
    allprojects {
        repositories {
            flatDir {
                dirs project(':rapidsnark-wrp').projectDir.absolutePath + '/libs'
                dirs project(':rarime-sdk').projectDir.absolutePath + '/libs'
                dirs project(':witnesscalculator').projectDir.absolutePath + '/libs'
            }
        }
    }
    `

    if (!buildGradle.includes(flatDirSnippet)) {
      config.modResults.contents = buildGradle + flatDirSnippet
    }
    return config
  })
}

// Optionally, add a similar plugin to modify the app-level build.gradle if necessary
const withCustomAppBuildGradle = config => {
  return withAppBuildGradle(config, config => {
    const appBuildGradle = config.modResults.contents
    // Optionally, add app-specific configurations here
    return config
  })
}

// Combine the changes
module.exports = config => {
  config = withCustomRootBuildGradle(config) // Modify root build.gradle
  config = withCustomAppBuildGradle(config) // Optionally modify app build.gradle
  return config
}
