# React-Native template for scaffolding app with Web3 | ZK | Documents scan features

### Prerequisities

Node version >= 20.15.0

#### install:

- [android studio](https://developer.android.com/studio/install)
- [xcode](https://developer.apple.com/xcode/)
- [eas-cli](https://docs.expo.dev/eas-update/getting-started/)
- [fastlane](https://docs.fastlane.tools/getting-started/ios/setup/)
- [Watchman](https://facebook.github.io/watchman/docs/install#buildinstall), required only for macOS
  or Linux users

#### create account in https://expo.dev/

Login to expo account
```bash
eas login
```

#### Register devices

**android**

- No additional requirements

**iOS**

- Create account with Apple developer program
- Register device with expo - `eas device:create`
- Configure `signing & capabilities` with xcode
- Turn on developer mode in device

#### Configure [app identifiers and package](./env.js)

Follow steps in the file to configure app identifiers and package names, your env variables and
validation

Keep in mind, that `development`, `staging` and `production` environment variables should be public
and not sensitive.

This is because EAS not see `.env` files if they are gitignored.

If you need to keep some sensitive data,
use [secrets](https://docs.expo.dev/build-reference/variables/) in EAS.

#### Add variables

Add new rules and variables in [env.js](./env.js) file with `zod` validations.
Create `.env | .env.developmend | .env.production` file and fill with your values.

After each change in .env file, you need to restart the server to apply changes.
If changes are not applied, try to reopen app by pressing "i" or rebuild project
with `npx expo run:ios --device` | `npx expo run: android --device`

### Development process

As it was mentioned before, by default this template has `development`, `staging` and `production`
environments. each of them will create separate builds, and also make it possible to set up multiple
app variants in the same device.

To configure your own custom environment, run scripts with desired `APP_ENV` variable, and also set
up it in [eas.json](./eas.json) file

#### Prebuild native code and start development server

Usually, you have to prebuild native code, and then compile project,
to do so, run prepared commands

### `Development` environment

#### Prebuild native code for iOS and Android

```bash
yarn prebuild
```

#### Start development server (metro server)

```bash
yarn start
```

### Compile app and start development server

#### iOS

```bash
yarn ios
```

#### Android

```bash
yarn android
```

---

### Release process
By default, everything should be automated, e.g.

Default case - Let's assume you finish ur feature branch.

1) After u create PR, GH actions will lint and ts-check ur code
2) After merge PR, you will have 2 options to release ur app for `internal distribution` (QA)
   - select `New App Version` workflow in GH actions and choose release type
   - or run `yarn app-release` locally, it will do the same as action above, and push changes to trigger next GH actions
3) After that, the `eas-build-qa` workflow will start, and it will build and publish app to `internal distribution` via EAS
4) The `Production` release should be triggered manually, by running `eas-production-build` workflow

**note**: This template doesn't submit app to stores, u should do it manually via EAS dashboard, or configure auto-submit in GH actions.
in that case you need to check eas submit configuration and follow the steps from [EAS](https://docs.expo.dev/submit/introduction/) docs.

### important!: Setup GitHub Actions
Add the required secrets to your GitHub repo:

`GH_TOKEN`: A [Github token](https://github.com/settings/tokens) with access to your repo.

`EXPO_TOKEN`: Expo token to authenticate with EAS. You can get generate yours [here](https://expo.dev/settings/access-tokens)

[//]: # (TBD: GH BOT?)

### second important! EAS first build
run prebuild and build locally for ur `environment`:

for example staging
```bash
yarn prebuild:staging
yarn build:staging:ios
yarn build:staging:android
```
The above commands will generate the required credentials for the build and store them in EAS servers so that we can use them later to trigger the build from GitHub actions.

Next time, if you want to test release build locally, before merge feature branch to main, you can run:
```bash
yarn build:staging:ios --local
```

it will create `*.ipa` file in root folder, so you could install it on ur device via [orbit](https://docs.expo.dev/build/orbit/)

### Third IMPORTANT! Android QA build
Due to this [issue](https://github.com/expo/expo/issues/27985), we are unable to build .apk file, if we are useing `*.aar` files.
To fix this, we will build `.aab` file, and then convert it to `.apk` file using `bundletool`.

so, prebuild and build locally for ur `environment`:
```bash
yarn prebuild:staging && yarn build:staging:android --local
```

After that, you will have `*.aab` file in `root` folder.

run:
```bash
bundletool build-apks --bundle=[generated_file].aab --output=dist/[my_awesoma_app_archive].apks --mode=universal
```

rename file and unarchive it
```bash
mv dist/[my_awesoma_app_archive].apks dist/[my_awesoma_app_archive].zip
```

unarchive it
```bash
unzip dist/[my_awesoma_app_archive].zip -d dist
```

The `universal.apk` file will be ur app, which u can distribute to ur QA team

### Good to know

#### Adding new dependencies

Each time you add new dependency, update app.config.ts, modify native code in modules or edit
podspec or gradle.build in modules files

you have to rebuild native code and run compile

```bash
yarn prebuild && yarn ios
yarn prebuild && yarn android
```

#### values & values-night

Here is not solution yet to keep same assets with same name in both values & values-night folders
and then use it from one entry point automatically.

So we need to keep both assets in different folders, and then use them separately in code.

#### Fetching data from API

Better to create function per endpoint, and then use useLoading hook to handle loading state in
component or use react-query for more benefits as like as caching, ...etc

#### E-Document module

To modify build config for e-Document module - [edit](./modules/e-document/plugin/src/index.ts) and then run `tsc` from `./modules/e-document/plugin` to compile expo-plugin

#### file paths as parameters to native modules

if u got file uri from expo file system, don't forget to remove `file://` from uri before passing it
to functions in native module.

```typescript
const zkProofBytes = await groth16ProveWithZKeyFilePath(
  authWtns,
  zkeyAsset.localUri.replace('file://', ''),
)
```

And for the release build, it would be better to wrap path string in native module functions, with:

**swift**
```swift
let path = URL(string: pathString)
```

**android**
```kotlin
val path = File(pathString)
```

### Troubleshooting

#### Error message: `CommandError: Failed to build iOS project. "xcodebuild" exited with error code 65.`

! usually happens when you add new dependency to project

1) rm -rf ~/Library/Developer/Xcode/DerivedData
2) rm -rf node_modules yarn.lock android ios && yarn install
3) manually run `npx expo prebuild --clean && npx pod-install`
4) manually run `npx expo run:ios`

```bash
rm -rf ~/Library/Developer/Xcode/DerivedData && rm -rf node_modules yarn.lock package-lock.json android ios .expo && yarn && npx expo prebuild --clean && npx pod-install && npx expo run:ios --device
```

