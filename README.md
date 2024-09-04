### Getting started
install:
```bash
npm install -g eas-cli
```

(unnecessary)
```bash
eas login
```

Node version: 20.15.0

### IOS build issue resolving

#### Error message: `CommandError: Failed to build iOS project. "xcodebuild" exited with error code 65.`

! usually happens when you add new dependency to project

1. rm -rf ~/Library/Developer/Xcode/DerivedData
2. rm -rf node_modules yarn.lock android ios
3. yarn
4. manually run `npx expo prebuild --clean && npx pod-install`
5. manually run `npx expo run:ios`

### values & values-night

Here is not solution yet to keep same assets with same name in both values & values-night folder.
And then use it from one entry point automatically, so we need to keep both assets in different folders,
and then use them separately in code.


### Environment variables
After each change in .env file, you need to restart the server to apply changes.
If changes are not applied, try to reopen app by pressing "i" or rebuild project with `yarn ios`


### Fetching data from API
Better to create function per endpoint, and then use useLoading hook to handle loading state in component or use react-query for more benefits as like as caching, ...etc

### E-Document module
On first install - go to ./modules/e-document/plugin and run `tsc` to compile expo-plugin

### groth16ProveWithZKeyFilePath
if u got file uri from expo file system, don't forget to remove `file://` from uri before passing it to `groth16ProveWithZKeyFilePath` function
```typescript
const zkProofBytes = await groth16ProveWithZKeyFilePath(
  authWtns,
  zkeyAsset.localUri.replace('file://', ''),
)
```
