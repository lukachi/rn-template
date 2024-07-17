### IOS build issue resolving
#### Error message: `CommandError: Failed to build iOS project. "xcodebuild" exited with error code 65.`
1. rm -rf ~/Library/Developer/Xcode/DerivedData
2. rm -rf node_modules yarn.lock android ios
3. yarn
4. yarn prebuild
5. yarn ios
