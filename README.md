
# React-Native template for scaffolding app with Web3 | ZK | Documents scan features

### Prerequisities
Node version >= 20.15.0

#### install:
```bash
npm install -g eas-cli
```

#### (unnecessary for development)
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
Follow steps in file to configure app identifiers and package names, your env variables and validation

### Development process

#### Prebuild native code and start development server
ios:
```bash
npx expo prebuild --clean && npx pod-install && npx expo run:ios --device
```

android:
```bash
npx expo prebuild --clean && npx expo run:android --device
```

#### Adding new dependencies
Each time you add new dependency, update app.config.ts, modify native code in modules or edit podspec or gradle.build in modules files

you have to rebuild native code and run compile
```
npx expo prebuild --clean && npx pod-install && npx expo run:ios --device
npx expo prebuild --clean && npx expo run:android --device
```

### Environment variables
Add new rules and variables in [env.js](./env.js) file with `zod` validations. Create `.env | .env.developmend | .env.production` file and fill with your values.

After each change in .env file, you need to restart the server to apply changes.
If changes are not applied, try to reopen app by pressing "i" or rebuild project with `npx expo run:ios --device` | `npx expo run: android --device`

### Good to know

#### values & values-night

Here is not solution yet to keep same assets with same name in both values & values-night folders and then use it from one entry point automatically.

So we need to keep both assets in different folders, and then use them separately in code.

#### Fetching data from API
Better to create function per endpoint, and then use useLoading hook to handle loading state in component or use react-query for more benefits as like as caching, ...etc

#### E-Document module
On first install - go to ./modules/e-document/plugin and run `tsc` to compile expo-plugin

#### groth16ProveWithZKeyFilePath
if u got file uri from expo file system, don't forget to remove `file://` from uri before passing it to `groth16ProveWithZKeyFilePath` function in native module

```typescript
const zkProofBytes = await groth16ProveWithZKeyFilePath(
  authWtns,
  zkeyAsset.localUri.replace('file://', ''),
)
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

