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

In [`env.ts`](env.ts), add your new variables with `zod` validations:

```javascript
const client = z.object({
  APP_ENV: z.enum(['development', 'staging', 'regtest', 'production']),
  VERSION: z.string(),

  // ADD YOUR CLIENT ENV VARS HERE
  SOME_PUBLIC_KEY_1: z.string(),
  SOME_PUBLIC_KEY_2: z.string(),
})

const buildTime = z.object({
  BUNDLE_ID: z.string().default('com.example.templateapp'), // ios bundle id
  PACKAGE: z.string().default('com.example.templateapp'), // android package name
  NAME: z.string().default('Template App'), // app name
  SLUG: z.string().default('template-app'), // app slug
  EXPO_ACCOUNT_OWNER: z.string().default('the_owner'), // expo account owner
  EAS_PROJECT_ID: z.string().default(''), // eas project id
  SCHEME: z.string().default('templateapp'), // app scheme
  // ADD YOUR BUILD TIME ENV VARS HERE
  SOME_ANOTHER_PUBLIC_KEY: z.string(),
})
```

After adding new variables, restart the development server to apply changes.

### Sensitive Data

#### For local development:

create `.env.secrets.development`, `.env.secrets.staging`, `.env.secrets.regtest`, and `.env.secrets.production` and fill them with your sensitive values.

Add them to `env.js` as you did with public values, but use `getSecretWithSuffix` method instead of using `process.env` straight.

This would be enough to run the app locally with `pnpm run prebuild && pnpm run ios` or `pnpm run prebuild && pnpm run android`.

If changes are not applied after modifying the `.env` files, try restart the development server or rebuild the project:

`pnpm run start`

#### For EAS Build:

The .env files are not included in the eas build, no matter it local or not, so we added `.easignore`, which repeats `.gitignore` rules, except `.env.secrets` files, so they will be included in eas build archive.

And that should be enough to build the app with `pnpm run prebuild:staging && pnpm run build:staging:ios && pnpm run build:staging:android`. (and `--local`)

#### For EAS Workflows (CI/CD):

EAS Workflows handle builds in the cloud. Make sure you have done EAS build preparations and configured credentials for your project.

1. **Push secrets to EAS:**

   ```bash
   pnpm run prepare-secrets
   ```

   This pushes secrets from `.env.secrets.*` files to EAS in `${APP_ENV_UPPERCASE}_SECRET_KEY` format.

2. **Configure EAS environment variables:**

   Go to your project on [expo.dev](https://expo.dev), navigate to **Secrets**, and ensure all required secrets are configured for each environment (development, staging, regtest, production).

3. **Trigger builds:**

   Builds are triggered manually via `eas workflow:run` or from the Expo Dashboard.

CONCLUSION:

This covers using secrets in `metro dev server`, local EAS builds, and EAS Workflow cloud builds.

---

## Development Process

By default, this template has `development`, `staging`, `regtest`, and `production` environments. Each of them will create separate builds and allow you to set up multiple app variants on the same device.

To configure your own custom environment, run scripts with the desired `APP_ENV` variable, and also set it up in the [eas.json](./eas.json) file.

### Prebuild Native Code and Start Development Server

You need to prebuild the native code before running the app:

```bash
pnpm run prebuild
```

Then start the Metro development server:

```bash
pnpm run start
```

### Run the App on Your Device or Emulator

**iOS:**

```bash
pnpm run ios
```

**Android:**

```bash
pnpm run android
```

**Note:** Ensure that you have a simulator or device connected.

## Versioning

This template uses semantic versioning with environment-aware build identifiers.

### Version Format

- **iOS `buildNumber`**: `{version}-{env}` (e.g., `0.1.0-staging`, `0.1.0-regtest`, `0.1.0` for production)
- **Android `versionCode`**: Unique integer derived from semver + environment
- **Android `versionName`**: Same as iOS buildNumber

### Android versionCode Calculation

The versionCode is automatically calculated to ensure uniqueness across versions and environments:

```
Format: M_NN_PP_XXYY (up to 9 digits)
  M    = major version (0-9)
  NN   = minor version (00-99)
  PP   = patch version (00-99)
  XXYY = environment code (derived from first 2 letters)
```

Environment codes are self-derived from alphabetical positions (a=01, b=02, ...z=26):

| Environment | Letters | Code | Example versionCode (0.1.0) |
| ----------- | ------- | ---- | --------------------------- |
| staging     | ST      | 1920 | 1001920                     |
| regtest     | RE      | 1805 | 1001805                     |
| production  | PR      | 1618 | 1001618                     |
| development | DE      | 0405 | 1000405                     |

This allows submitting multiple environment builds of the same semver to the stores without conflicts.

---

## Release Process

This template uses **EAS Workflows** for building and submitting apps.

### Build & Submit

To build and submit a specific environment:

```bash
# Build & submit staging only
eas workflow:run build-manual.yml --input profile=staging

# Build & submit regtest only
eas workflow:run build-manual.yml --input profile=regtest

# Build & submit production only
eas workflow:run build-manual.yml --input profile=production
```

You can also trigger builds from the [Expo Dashboard](https://expo.dev) under your project's **Workflows** tab, where you'll get a dropdown to select the profile.

### EAS Workflows

Workflows are defined in `.eas/workflows/`:

| Workflow           | Trigger                   | Description                           |
| ------------------ | ------------------------- | ------------------------------------- |
| `build-manual.yml` | Manual (CLI or Dashboard) | Builds & submits selected environment |

### Distribution

All non-development builds are configured for store distribution:

- **iOS**: TestFlight (use Test Groups to distribute different builds to different QA teams)
- **Android**: Play Store Internal Track

### Important! Setup EAS

1. **Link your project to EAS:**

   ```bash
   eas init
   ```

2. **Generate an Expo token** for CI/CD: [Expo Access Tokens](https://expo.dev/settings/access-tokens)

3. **Configure App Store Connect** (iOS) and **Google Play Console** (Android) credentials in EAS:

   ```bash
   eas credentials
   ```

   See [EAS Submit documentation](https://docs.expo.dev/submit/introduction/) for detailed setup.

### Second Important! EAS First Build (Required Before CI/CD)

**Before triggering any GitHub workflow or EAS workflow, you MUST run the prebuild and build commands locally first.** This is required to generate and upload credentials to EAS servers. Without this step, CI/CD builds will fail due to missing credentials.

Run the prebuild and build commands locally for **each environment** you plan to use in CI/CD:

```bash
# For staging
pnpm run prebuild:staging && pnpm run build:staging:ios
pnpm run prebuild:staging && pnpm run build:staging:android

# For production
pnpm run prebuild:production && pnpm run build:production:ios
pnpm run prebuild:production && pnpm run build:production:android

# For regtest (if needed)
pnpm run prebuild:regtest && pnpm run build:regtest:ios
pnpm run prebuild:regtest && pnpm run build:regtest:android
```

During the build process, you will be prompted to:

- Log in to your Apple Developer account (iOS)
- Create or select a distribution certificate and provisioning profile (iOS)
- Create or provide Keystore information (Android)

Follow the prompts to complete the setup.

These commands will:

- Generate native project files with the correct `APP_ENV`.
- Build the app and trigger credential generation prompts.
- Upload credentials to EAS servers for future cloud builds.

**Only after completing these steps** can you trigger builds via EAS Workflows or GitHub Actions.

**Testing Release Builds Locally:**

To test release builds locally before merging to the main branch:

```bash
pnpm run prebuild:staging && pnpm run build:staging:ios --local
pnpm run prebuild:staging && pnpm run build:staging:android --local
```

This will create `.ipa` and `.apk` files in the root folder, which you can install on your device using [Expo's Orbit tool](https://docs.expo.dev/build/orbit/).

### Third Important! Android QA Build

#### Updated: fixed by [this plugin](./plugins/withLocalAar.plugin.js), and not necessary anymore

Note:
To know what to put instead of `my-module-with-lib` in `dirs project(':my-module-with-lib').projectDir.absolutePath + '/libs'`

you can run android project at the android studio e.g.

```bash
studio android
```

config gradle plugin e.g. zulu 17 at this moment. And in logs you will see all modules names, including yours.
that is the name you should use.

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
   pnpm run prebuild:staging && pnpm run build:staging:android --local
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
   pnpm run prebuild
   pnpm run ios    # or pnpm run android
   ```

**Note:** Always run `pnpm run prebuild` after adding dependencies that include native code to ensure that your native projects are updated.

### Values & Values-Night

Currently, there isn't a solution to keep the same assets with the same name in both `values` and `values-night` folders and use them from one entry point automatically.

We need to keep both assets in different folders and use them separately in code.

### Fetching Data from API

It's better to create a function per endpoint and then use hooks like `useLoading` to handle the loading state in the component or use libraries like [React Query](https://react-query.tanstack.com/) for benefits like caching.

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
   rm -rf node_modules pnpm-lock.yaml package-lock.json android ios .expo
   pnpm install
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
rm -rf ~/Library/Developer/Xcode/DerivedData && rm -rf node_modules pnpm-lock.yaml package-lock.json android ios .expo && pnpm run && npx expo prebuild --clean && npx pod-install && npx expo run:ios --device
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
