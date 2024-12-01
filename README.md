# React Native Template for Scaffolding App with Web3 | ZK | Document Scan Features

This repository provides a React Native template for building applications with Web3 integrations, zero-knowledge proofs, and document scanning capabilities. It is designed to help you quickly set up a project with these features and streamline your development process.

## Prerequisites

Before you begin, ensure you have the following installed on your machine:

- **Node.js** (version >= 20.15.0)

  - [Download Node.js](https://nodejs.org/en/download/) or use a version manager like [nvm](https://github.com/nvm-sh/nvm) for easy version management.

- **Android Studio**

  - [Download Android Studio](https://developer.android.com/studio/install) and install the latest stable version.
  - Install the Android SDK and set up environment variables as per the [React Native environment setup guide](https://reactnative.dev/docs/environment-setup).

- **Xcode** (for macOS users)

  - Install from the [Mac App Store](https://apps.apple.com/us/app/xcode/id497799835?mt=12).
  - Ensure command-line tools are installed by running:

    ```bash
    xcode-select --install
    ```

- **EAS CLI**

  - Install globally using npm:

    ```bash
    npm install -g eas-cli
    ```

  - Refer to the [EAS CLI documentation](https://docs.expo.dev/eas-update/getting-started/) for more details.

- **Fastlane**

  - Install via RubyGems:

    ```bash
    sudo gem install fastlane -NV
    ```

  - See the [Fastlane getting started guide](https://docs.fastlane.tools/getting-started/ios/setup/) for configuration.

- **Git LFS**

  - Install Git LFS:

    ```bash
    brew install git-lfs
    git lfs install
    ```

  - Visit the [Git LFS website](https://git-lfs.github.com/) for more information.

- **Watchman** (required only for macOS or Linux users)

  - Install via Homebrew:

    ```bash
    brew install watchman
    ```

## Expo Account Setup

Create an account on [Expo](https://expo.dev/) if you haven't already.

Login to your Expo account:

```bash
eas login
```

## Register Devices

### Android

- No additional requirements.

### iOS

- Enroll in the [Apple Developer Program](https://developer.apple.com/programs/enroll/).
- Register your device with Expo:

  ```bash
  eas device:create
  ```

- Configure **Signing & Capabilities** with Xcode (optional, the CLI may prompt you to choose a signing team).
- Enable **Developer Mode** on your iOS device.

## Configure App Identifiers and Package Names

Follow the steps in the [env.js](./env.js) file to configure app identifiers, package names, and environment variables with `zod` validations.

---

### Environment Variables

Create `.env`, `.env.development`, and `.env.production` files in the root directory and fill them with your public values.
Here's an example of what your `.env` file might look like:

### !IMPORTANT!

These files are public and should not contain any sensitive data.

```env
SOME_PUBLIC_KEY_1=some_public_value_1
SOME_PUBLIC_KEY_2=some_public_value_2
SOME_OTHER_VARIABLE=your-value
```

### Validating New Variables

In `env.js`, add your new variables with `zod` validations:

```javascript
const client = z.object({
  APP_ENV: z.enum(['development', 'staging', 'production']),
  NAME: z.string(),
  SCHEME: z.string(),
  BUNDLE_ID: z.string(),
  PACKAGE: z.string(),
  VERSION: z.string(),

  // ADD YOUR CLIENT ENV VARS HERE
  SOME_PUBLIC_KEY_1: z.string(),
  SOME_PUBLIC_KEY_2: z.string(),
})

const buildTime = z.object({
  EXPO_ACCOUNT_OWNER: z.string(),
  EAS_PROJECT_ID: z.string(),
  // ADD YOUR BUILD TIME ENV VARS HERE
  SOME_ANOTHER_PUBLIC_KEY: z.string(),
})
```

And get them:

```javascript
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
  SOME_PUBLIC_KEY_1: process.env.SOME_PUBLIC_KEY_1,
  SOME_PUBLIC_KEY_2: process.env.SOME_PUBLIC_KEY_2,
}

/**
 * @type {Record<keyof z.infer<typeof buildTime> , unknown>}
 */
const _buildTimeEnv = {
  EXPO_ACCOUNT_OWNER,
  EAS_PROJECT_ID,

  // ADD YOUR ENV VARS HERE TOO
  SOME_ANOTHER_PUBLIC_KEY: process.env.SOME_ANOTHER_PUBLIC_KEY,
}
```

After adding new variables, restart the development server to apply changes.

### Sensitive Data

#### For local development:

create `.env.secrets.development`, `.env.secrets.staging`, and `.env.secrets.production` and fill them with your sensitive values.

Add them to `env.js` as you did with public values, but use `getSecretWithSuffix` method instead of using `process.env` straight.

This would be enough to run the app locally with `yarn prebuild && yarn ios` or `yarn prebuild && yarn android`.

If changes are not applied after modifying the `.env` files, try restart the development server or rebuild the project:

`yarn start`

#### For EAS Build:

The .env files are not included in the eas build, no matter it local or not, so we added `.easignore`, which repeats `.gitignore` rules, except `.env.secrets` files, so they will be included in eas build archive.

And that should be enough to build the app with `yarn prebuild:staging && yarn build:staging:ios && yarn build:staging:android`. (and `--local`)

#### For CI/CD:

As far as CI just triggers the build, make sure you have done EAS build preparations, published secrets and prepared credentials for your eas project.

Then run:

`yarn prepare-secrets`

It will push secrets from `.env.secrets.*` files to the EAS servers secrets in a `${APP_ENV_UPPERCASE}_SECRET_KEY` format.

Then make sure you have added all secrets keys to [eas-build](.github/actions/eas-build/action.yml) action.
You just need the key name, e.g. `envkey_SECRET_KEY: DO_NOT_CHANGE` to pass expo config check, and the value will be taken from the EAS dashboard.

That will be enough to run these workflows in repo actions.

CONCLUSION:

This will cover using secrets in `metro dev server`, local and local-triggered eas builds, and CI/CD triggered eas builds.

---

## Development Process

By default, this template has `development`, `staging`, and `production` environments. Each of them will create separate builds and allow you to set up multiple app variants on the same device.

To configure your own custom environment, run scripts with the desired `APP_ENV` variable, and also set it up in the [eas.json](./eas.json) file.

### Prebuild Native Code and Start Development Server

You need to prebuild the native code before running the app:

```bash
yarn prebuild
```

Then start the Metro development server:

```bash
yarn start
```

### Run the App on Your Device or Emulator

**iOS:**

```bash
yarn ios
```

**Android:**

```bash
yarn android
```

**Note:** Ensure that you have a simulator or device connected.

### IMPORTANT! IOS SIMULATOR NOT WORKS

Due to `e-document` module, and `NFCPassportReader` pod limitations. The iOS build can't be run on the simulator. Please use a real device for testing.

Or if you don't need this module, simply remove [e-document](modules/e-document) directory from the app, all imports and usages of this module, `extraPods` `NFCPassportReader` from [app.config.ts](app.config.ts) and then run the app on the simulator.

---

## Release Process

By default, everything should be automated.

### Default Case

Let's assume you finish your feature branch.

1. **Create a Pull Request (PR):**

- GitHub Actions will lint and type-check your code.

2. **Merge the PR:**

- After merging, you have two options to release your app for internal distribution (QA):
  - Select the **New App Version** workflow in GitHub Actions and choose the release type.
  - Or run `yarn app-release` locally; it will do the same as the action above and push changes to trigger the next GitHub Actions.

3. **Build and Publish the App:**

- Run the `eas-build-qa` workflow; it will build and publish the app for internal distribution via EAS.

4. **Production Release:**

- The `Production` release works the same way by running the `eas-production-build` workflow.

**Note:** This template doesn't submit the app to stores automatically. You should do it manually via the EAS dashboard or configure auto-submit in GitHub Actions. In that case, you need to check the EAS submit configuration and follow the steps from the [EAS Submit documentation](https://docs.expo.dev/submit/introduction/).

### Important! Setup GitHub Actions

Add the required secrets to your GitHub repository:

- **`GH_TOKEN`**: A [GitHub Personal Access Token](https://github.com/settings/tokens) with `repo` and `workflow` scopes to allow GitHub Actions to interact with your repository.

- **`EXPO_TOKEN`**: An Expo token to authenticate with EAS. Generate one [here](https://expo.dev/settings/access-tokens) with the necessary permissions.

**Workflows:**

The GitHub Actions workflows are defined in the `.github/workflows` directory:

- **`new-app-version.yml`**: Handles incrementing the app version and pushing changes.
- **`eas-build-qa.yml`**: Builds and publishes the app for internal distribution (QA).
- **`eas-production-build.yml`**: Builds and publishes the app for production release.

To customize the workflows, edit the YAML files as needed.

**Permissions:**

Ensure that GitHub Actions has the necessary permissions to run workflows. Check your repository settings under **Settings > Actions > General** and adjust the **Workflow permissions** accordingly.

[//]: # 'TBD: GH BOT?'
[//]: # 'TBD: EAS UPDATE?'
[//]: # 'TBD: EAS SUBMIT?'

### Second Important! EAS First Build

Your first build should be done locally to generate the necessary credentials on the EAS servers.

Run the prebuild and build commands locally for your environment (e.g., staging):

```bash
yarn prebuild:staging && yarn build:staging:ios
yarn prebuild:staging && yarn build:staging:android
```

During the build process, you may be prompted to log in to your Apple Developer account or provide Keystore information for Android. Follow the prompts to complete the setup.

These commands will:

- Generate native project files.
- Build the app locally.
- Upload credentials to EAS servers for future cloud builds.

**Testing Release Builds Locally:**

To test release builds locally before merging to the main branch:

```bash
yarn prebuild:staging && yarn build:staging:ios --local
yarn prebuild:staging && yarn build:staging:android --local
```

This will create `.ipa` and `.apk` files in the root folder, which you can install on your device using [Expo's Orbit tool](https://docs.expo.dev/build/orbit/).

### Third Important! Android QA Build

#### Updated: fixed by [this plugin](./plugins/withLocalAar.plugin.js), and not necessary anymore

Due to [this issue](https://github.com/expo/expo/issues/27985), building an `.apk` file directly may not be possible when using `*.aar` files. As a workaround, we'll build an `.aab` file and convert it to a universal `.apk` using `bundletool`.

**Install Bundletool:**

Download `bundletool.jar` from the [official GitHub repository](https://github.com/google/bundletool/releases/latest).

Alternatively, install via Homebrew:

```bash
brew install bundletool
```

**Build and Convert the App Bundle:**

1. **Build the `.aab` file:**

   ```bash
   yarn prebuild:staging && yarn build:staging:android --local
   ```

2. **Convert `.aab` to `.apk` using `bundletool`:**

   ```bash
   bundletool build-apks --bundle=app-release.aab --output=dist/app.apks --mode=universal
   ```

- Replace `app-release.aab` with the name of your generated AAB file.
- The output `app.apks` file is actually a ZIP archive.

3. **Extract the Universal APK:**

   ```bash
   unzip dist/app.apks -d dist
   ```

4. **Locate the `universal.apk` File:**

- The `universal.apk` file inside the `dist` directory is the APK you can distribute to your QA team.

**Note:** Ensure that you have Java installed on your machine, as `bundletool` requires it.

**Distribute the APK:**

- You can now share the `universal.apk` file with your QA team for testing.

## Good to Know

### Adding New Dependencies

When you add a new dependency that requires native modules:

1. **Update `app.config.ts`:**

- Add any necessary configuration for the dependency.

2. **Modify Native Code (if required):**

- For iOS, update the `Podfile` or relevant files.
- For Android, modify `build.gradle` or other necessary files.

3. **Rebuild Native Code:**

   ```bash
   yarn prebuild
   yarn ios    # or yarn android
   ```

**Note:** Always run `yarn prebuild` after adding dependencies that include native code to ensure that your native projects are updated.

### Values & Values-Night

Currently, there isn't a solution to keep the same assets with the same name in both `values` and `values-night` folders and use them from one entry point automatically.

We need to keep both assets in different folders and use them separately in code.

### Fetching Data from API

It's better to create a function per endpoint and then use hooks like `useLoading` to handle the loading state in the component or use libraries like [React Query](https://react-query.tanstack.com/) for benefits like caching.

### E-Document Module

To modify the build configuration for the E-Document module, edit the plugin at [./modules/e-document/plugin/src/index.ts](./modules/e-document/plugin/src/index.ts) and then run `tsc` from `./modules/e-document/plugin` to compile the Expo plugin.

### File Paths as Parameters to Native Modules

If you get a file URI from the Expo FileSystem, don't forget to remove `file://` from the URI before passing it to functions in a native module.

```typescript
const zkProofBytes = await groth16ProveWithZKeyFilePath(
  authWtns,
  zkeyAsset.localUri.replace('file://', ''),
)
```

For the release build, it's better to wrap the path string in native module functions:

**Swift**

```swift
let path = URL(string: pathString)
```

**Android (Kotlin)**

```kotlin
val path = File(pathString)
```

## Troubleshooting

### Error: `CommandError: Failed to build iOS project. "xcodebuild" exited with error code 65.`

This usually happens when you add a new dependency to the project.

**Solution:**

1. Clean Xcode derived data:

   ```bash
   rm -rf ~/Library/Developer/Xcode/DerivedData
   ```

2. Remove cached files and reinstall dependencies:

   ```bash
   rm -rf node_modules yarn.lock package-lock.json android ios .expo
   yarn install
   ```

3. Prebuild and install pods:

   ```bash
   npx expo prebuild --clean
   npx pod-install
   ```

4. Run the app:

   ```bash
   npx expo run:ios --device
   ```

**One-liner Command:**

```bash
rm -rf ~/Library/Developer/Xcode/DerivedData && rm -rf node_modules yarn.lock package-lock.json android ios .expo && yarn && npx expo prebuild --clean && npx pod-install && npx expo run:ios --device
```

### Error: `Error: spawn ./gradlew EACCES`

This error indicates a permission issue with Gradle wrapper scripts.

**Solution:**

- Grant execute permissions to Gradle wrapper scripts:

  ```bash
  chmod +x android/gradlew
  ```

### Debugging Tips

- **Check Build Logs:**

  - For iOS, open Xcode and check the build logs for more detailed error messages.
  - For Android, use Android Studio's logcat to view logs.

- **Clean Project:**

  - Sometimes, cleaning the build folders helps resolve issues:

    ```bash
    cd android && ./gradlew clean
    ```

---

**Happy Coding!**
