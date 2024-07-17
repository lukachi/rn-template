### IOS build issue resolving
#### Error message: `CommandError: Failed to build iOS project. "xcodebuild" exited with error code 65.`

! usually happens when you add new dependency to project

1. rm -rf ~/Library/Developer/Xcode/DerivedData
2. rm -rf node_modules yarn.lock android ios
3. yarn
4. manually `run npx expo prebuild --cache && npx pod-install`
5. manually run `npx expo run:ios`
