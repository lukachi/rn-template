# Expo React Native Template

A production-ready template for Expo React Native development with multi-environment support, automated CI/CD via EAS Workflows, and streamlined release process to TestFlight and Google Play.

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

## Configure App Identifiers

Edit the defaults in [`env.ts`](env.ts) to match your app:

```typescript
const buildTime = z.object({
  BUNDLE_ID: z.string().default('com.yourcompany.yourapp'), // iOS bundle id
  PACKAGE: z.string().default('com.yourcompany.yourapp'), // Android package name
  NAME: z.string().default('Your App'), // App display name
  SLUG: z.string().default('your-app'), // App slug
  EXPO_ACCOUNT_OWNER: z.string().default('your-expo-username'),
  EAS_PROJECT_ID: z.string().default(''), // Set after running `eas init`
  SCHEME: z.string().default('yourapp'), // Deep link scheme
})
```

---

## Environment Variables

This template uses per-environment `.env` files with Zod validation.

### File Structure

```
.env.development          # Public vars for development
.env.staging              # Public vars for staging
.env.regtest              # Public vars for regtest
.env.production           # Public vars for production
.env.secrets.development  # Secrets for development (git-ignored)
.env.secrets.staging      # Secrets for staging (git-ignored)
.env.secrets.regtest      # Secrets for regtest (git-ignored)
.env.secrets.production   # Secrets for production (git-ignored)
```

### Example `.env.{environment}` file

```env
API_URL=https://api.example.com
```

### Adding New Variables

In [`env.ts`](env.ts), add your variables to the appropriate schema:

```typescript
const client = z.object({
  VERSION: z.string().default(packageJSON.version),
  APP_ENV: z.enum(['development', 'staging', 'regtest', 'production']),
  API_URL: z.url(),
  // Add your runtime variables here
})
```

### How Environment Loading Works

The `env.ts` file automatically loads the correct `.env` files based on `APP_ENV`:

```typescript
dotenv.config({
  path: [
    path.resolve(__dirname, `.env.${APP_ENV}`),
    path.resolve(__dirname, `.env.secrets.${APP_ENV}`),
  ],
})
```

### Secrets Management

#### Local Development

Create `.env.secrets.{environment}` files for sensitive values. These are git-ignored but loaded automatically.

#### EAS Build (Local or Cloud)

The `.easignore` file is configured to include `.env.secrets.*` files in the EAS build archive, so your secrets are available during the build.

#### EAS Workflows (CI/CD)

For cloud builds via EAS Workflows, push your secrets to EAS:

```bash
pnpm run prepare-secrets
```

This uploads secrets from `.env.secrets.*` files to EAS in `${APP_ENV_UPPERCASE}_SECRET_KEY` format.

You can also manually configure secrets at [expo.dev](https://expo.dev) → Your Project → **Secrets**.

---

## Development Process

This template supports `development`, `staging`, `regtest`, and `production` environments. All environments share the same bundle ID/package name—environments are distinguished through versioning (see [Versioning](#versioning) section), not separate app variants.

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

This template uses a streamlined release flow: **Release Script → GitHub Release → EAS Workflow**.

### Prerequisites for Distribution

Before you can trigger a release, complete these steps in order:

---

### Step 1: Setup EAS Project

1. **Link your project to EAS:**

   ```bash
   eas init
   ```

   This creates your project on [expo.dev](https://expo.dev) and sets the `EAS_PROJECT_ID` in your config.

2. **Generate an Expo token** for CI/CD: [Expo Access Tokens](https://expo.dev/settings/access-tokens)

   Add this token as `EXPO_TOKEN` secret in your GitHub repository settings.

---

### Step 2: Setup EAS Build Credentials (Required First!)

**This is the first thing you must do once ready to distribute.** Before any CI/CD workflow can build your app, you must run a build locally to generate and upload credentials to EAS servers.

Run for **each environment** you plan to use:

```bash
# For production
pnpm run prebuild:production && pnpm run build:production:ios
pnpm run prebuild:production && pnpm run build:production:android

# For staging
pnpm run prebuild:staging && pnpm run build:staging:ios
pnpm run prebuild:staging && pnpm run build:staging:android

# For regtest (if needed)
pnpm run prebuild:regtest && pnpm run build:regtest:ios
pnpm run prebuild:regtest && pnpm run build:regtest:android
```

During the build, you will be prompted to:

- **iOS**: Log in to your Apple Developer account, create/select distribution certificate and provisioning profile
- **Android**: Create or provide Keystore information

These credentials are uploaded to EAS and reused for all future cloud builds.

**Testing Release Builds Locally:**

```bash
pnpm run prebuild:staging && pnpm run build:staging:ios --local
pnpm run prebuild:staging && pnpm run build:staging:android --local
```

- **iOS**: Creates `.ipa` file, installable via [Expo Orbit](https://docs.expo.dev/build/orbit/)
- **Android**: Creates `.aab` file (Android App Bundle) since we use `distribution: store`. To install locally, use [bundletool](https://developer.android.com/tools/bundletool) to extract an APK:

  ```bash
  # Install bundletool (macOS)
  brew install bundletool

  # Generate APKs from AAB
  bundletool build-apks --bundle=build.aab --output=build.apks --mode=universal

  # Extract the universal APK
  unzip build.apks -d extracted && mv extracted/universal.apk ./app.apk
  ```

---

### Step 3: Setup Store Submission Credentials

After build credentials are configured, set up submission credentials for automatic TestFlight and Play Store deployment.

#### iOS: App Store Connect Setup

##### 3.1 Create App in App Store Connect

This step **cannot be automated** - Apple requires manual app creation.

1. Go to [App Store Connect](https://appstoreconnect.apple.com/)
2. Click **My Apps** → **+** → **New App**
3. Fill in:
   - **Platform**: iOS
   - **Name**: Your app's display name
   - **Primary Language**: Select your language
   - **Bundle ID**: Must match `BUNDLE_ID` in your env config
   - **SKU**: A unique identifier (e.g., `com.yourcompany.yourapp.2024`)
4. Click **Create**
5. Note your **Apple ID** (numeric, found in App Information → General Information)

##### 3.2 Create App Store Connect API Key

1. Go to [App Store Connect → Users and Access → Integrations → App Store Connect API](https://appstoreconnect.apple.com/access/integrations/api)
2. Click **Generate API Key** (or **+**)
3. Enter a name (e.g., `EAS Submit Key`)
4. Select **Admin** access (required for TestFlight)
5. Click **Generate**
6. **Download the `.p8` file immediately** - you can only download it once!
7. Note:
   - **Issuer ID**: Displayed at the top of the page
   - **Key ID**: Displayed next to your key name

##### 3.3 Configure ASC API Key in EAS

```bash
eas credentials
```

Select:

1. **iOS**
2. **App Store Connect API Key: Manage your API Key**
3. **Set up an API Key for your project**
4. **Add a new API key**

Enter the Issuer ID, Key ID, and path to your `.p8` file.

#### Android: Google Play Console Setup

##### 3.1 Create App and Upload First Build Manually

> **Important**: Google requires the first Android app submission to be done manually through the Play Console. Automated tools like EAS Submit can only be used for subsequent submissions. See [Expo's guide on first Android submission](https://github.com/expo/fyi/blob/main/first-android-submission.md) for details.

1. Go to [Google Play Console](https://play.google.com/console)
2. Click **Create app** and fill in required details (name, language, app type, pricing)
3. Complete all dashboard setup tasks (privacy policy, app content, store listing)
4. Navigate to **Release** → **Testing** → **Internal testing**
5. Click **Create new release** and upload your first `.aab` file manually
6. When prompted for app signing, select **"Use Google-generated key"** (recommended for future uploads)
7. Complete the release and submit for review

To get your AAB file for manual upload:

```bash
# Build locally
pnpm run prebuild:production && pnpm run build:production:android --local

# Or download from EAS after a cloud build
eas build:list --platform android
# Then download the artifact from the EAS dashboard
```

##### 3.2 Set Up Service Account for Automated Submissions

After the first manual submission, set up a service account for automated releases:

1. Set up a service account with API access - see [EAS Submit Android docs](https://docs.expo.dev/submit/android/)
2. Configure in EAS:

   ```bash
   eas credentials
   ```

   Select Android and follow the prompts for Google Service Account Key.

---

### Step 4: Trigger a Release

Once all credentials are configured, you can trigger releases using the release script:

```bash
pnpm run release
```

This uses [release-it](https://github.com/release-it/release-it) to:

1. Bump the version in `package.json`
2. Create a git commit and tag
3. Push to GitHub
4. Create a GitHub Release

The GitHub Release automatically triggers the [release workflow](.github/workflows/release.yml), which dispatches the EAS Workflow to build and submit your app.

### Release Flow

```
pnpm run release
       ↓
GitHub Release (tag created)
       ↓
.github/workflows/release.yml (triggered on release publish)
       ↓
eas workflow:run build-release.yml
       ↓
EAS builds iOS & Android → Submits to TestFlight & Play Store Internal Track
```

### How `submit_ios` Works

The `submit_ios` job in [.eas/workflows/build-release.yml](.eas/workflows/build-release.yml):

```yaml
submit_ios:
  name: Submit iOS Build
  type: submit
  needs: [get_ios_build, build_ios]
  if: ${{ (inputs.submit == true || inputs.submit == null) && (inputs.profile || 'production') != 'development' }}
  params:
    build_id: ${{ needs.build_ios.outputs.build_id || needs.get_ios_build.outputs.build_id }}
    profile: ${{ inputs.profile || 'production' }}
```

- **`type: submit`**: EAS's built-in job type for store submission
- **References build**: Takes `build_id` from new or cached build
- **Uses submit profile**: Reads config from `eas.json` submit profiles
- **Handles auth**: Uses the ASC API Key configured in EAS credentials
- **Skips dev builds**: The `if` condition prevents submission for development profile

### Distribution

- **iOS**: TestFlight (use Test Groups to distribute to QA teams)
- **Android**: Play Store Internal Track

---

## Good to Know

### Fingerprint-Based Builds & OTA Updates

This template uses EAS **fingerprint** approach to optimize builds and enable efficient update delivery.

#### What is Fingerprint?

A fingerprint is a hash that represents your app's native code state. EAS calculates this hash based on native dependencies, config plugins, and native code changes. The workflow ([build-release.yml](.eas/workflows/build-release.yml)) uses fingerprints to:

- **Skip redundant builds**: If a build with the same fingerprint exists, it reuses that build instead of creating a new one
- **Save build minutes**: Only rebuild when native code actually changes
- **Enable smart OTA updates**: Determine whether changes require a new binary or can be delivered over-the-air

#### How Updates Are Delivered

| Change Type                                         | Fingerprint Changes? | Delivery Method               |
| --------------------------------------------------- | -------------------- | ----------------------------- |
| Native code (new SDK, native module, config plugin) | ✅ Yes               | New build → Store submission  |
| JS/TS code only                                     | ❌ No                | OTA update via `expo-updates` |
| Assets (images, fonts)                              | ❌ No                | OTA update via `expo-updates` |

#### How OTA Updates Work

When you release and the fingerprint matches an existing build:

1. **No new build is created** — the existing build is reused
2. **EAS Update publishes the JS bundle** to the update channel
3. **Users receive the update** on next app launch (or immediately with `Updates.fetchUpdateAsync()`)

This means JS-only changes can reach users instantly without going through App Store / Play Store review.

#### Workflow in Practice

```
pnpm run release (bumps version, creates GitHub Release)
       ↓
EAS Workflow runs fingerprint check
       ↓
┌─────────────────────────────────────────────────────────┐
│ Fingerprint changed?                                     │
│   YES → Build new binary → Submit to stores             │
│   NO  → Reuse existing build → Publish OTA update       │
└─────────────────────────────────────────────────────────┘
```

#### Channels

Each environment has its own update channel (configured in `eas.json`):

- `production` → production channel
- `staging` → staging channel
- `regtest` → regtest channel
- `development` → development channel

Users on a specific build only receive updates from their matching channel.

---

### Managing Environments & Channels

The predefined environments (`development`, `staging`, `regtest`, `production`) are just defaults—you can customize, add, or remove them to fit your workflow.

#### Adding a New Environment

1. **Create environment files:**

   ```bash
   touch .env.myenv
   touch .env.secrets.myenv  # git-ignored, for sensitive values
   ```

2. **Update `env.ts`** — add your environment to the allowed values:

   ```typescript
   const client = z.object({
     APP_ENV: z.enum(['development', 'staging', 'regtest', 'production', 'myenv']),
     // ...
   })
   ```

3. **Add EAS build profile in `eas.json`:**

   ```json
   {
     "build": {
       "myenv": {
         "channel": "myenv",
         "distribution": "store",
         "env": {
           "APP_ENV": "myenv"
         }
         // ... copy other settings from existing profiles
       }
     },
     "submit": {
       "myenv": {
         "android": { "track": "internal" }
       }
     }
   }
   ```

4. **Add npm scripts in `package.json`:**

   ```json
   {
     "scripts": {
       "prebuild:myenv": "cross-env APP_ENV=myenv pnpm prebuild",
       "build:myenv:ios": "cross-env APP_ENV=myenv eas build --profile myenv --platform ios",
       "build:myenv:android": "cross-env APP_ENV=myenv eas build --profile myenv --platform android"
     }
   }
   ```

5. **Update EAS Workflow** (if using automated releases) — add your environment to the profile options in [build-release.yml](.eas/workflows/build-release.yml):

   ```yaml
   inputs:
     profile:
       type: choice
       options:
         - production
         - staging
         - regtest
         - development
         - myenv # add here
   ```

#### Removing an Environment

1. Delete the `.env.{environment}` and `.env.secrets.{environment}` files
2. Remove the environment from `env.ts` enum
3. Remove the build/submit profile from `eas.json`
4. Remove related npm scripts from `package.json`
5. Remove from EAS Workflow options if applicable

#### Channel Strategy Tips

- **Channels are independent of environments** — you could have multiple environments share a channel, or each environment with its own
- **OTA updates target channels** — users receive updates from the channel their build was created with
- **Promote builds across tracks, not channels** — for store releases, promote builds through store tracks (internal → beta → production) rather than changing channels

---

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
