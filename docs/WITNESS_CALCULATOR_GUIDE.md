# Witnesscalculator guide

## Introduction

Since this project was created mainly to generate zkp, we will need tools to generate witness, and zkp respectively.

The rapidsnark-wrp module is responsible for zkp - it implements methods from ios-rapidsnark & android-rapidsnark libraries.

Witness is a bit more complicated. After generating artifacts from circom file - we get cpp, js & wasm files.

To run witness calculations with js - it is enough to run witness_calculator.js with appropriate parameters and path to wasm file.

With cpp files it is more complicated. To run them on iOS & Android you need to compile these files into a static library: “.a” files for iOS & “.so” files for Android.

This [repository](https://github.com/0xPolygonID/witnesscalc) can help you with that.

---

Suppose you have already compiled a circom file, for example auth.circom and got cpp files: auth.cpp and auth.dat files.

The standard procedure to get a static library for generating our witness is as follows:

we need to install the necessary dependencies before compilation. The README file of the witnesscalc repository will help in this.

In brief:

1. You should already have Android Studio installed. In the SDK settings you need to set `ndk v.23.1.7779620`, then in your terminal configuration “.zshrc” or “.bashrc” add “export ANDROID_NDK=/home/test/Android/Sdk/ndk/23.1.7779620” to your terminal configuration

2.

```
git submodule init
git submodule update
```

3. Let's compile auxiliary libraries that are dependencies of our future static libraries.

```
./build_gmp.sh android
./build_gmp.sh ios
```

You will only need to do this once.

And now - the code part:

4. open witnesscalc project mentioned above.
5. copy `auth.cpp` && `auth.dap` files to `src` folder, similar files will be located there.
6. In `auth.cpp` file, we need to wrap all the code as said here https://github.com/0xPolygonID/witnesscalc?tab=readme-ov-file#updating-circuits then replace `assert(` with `check(` in the whole file.
7. Next, in the same folder you need to create `witnesscalc_auth.cpp` and `witnesscalc_auth.h`, I think you have already noticed the same files respectively. (The content will be the same, but the name will be `auth` in our case)

witnesscalc_auth.cpp

```cpp
#include "witnesscalc_auth.h"
#include "witnesscalc.h"

int
witnesscalc_auth(
    const char *circuit_buffer,  unsigned long  circuit_size,
    const char *json_buffer,     unsigned long  json_size,
    char       *wtns_buffer,     unsigned long *wtns_size,
    char       *error_msg,       unsigned long  error_msg_maxsize)
{
    return CIRCUIT_NAME::witnesscalc(circuit_buffer, circuit_size,
                       json_buffer,   json_size,
                       wtns_buffer,   wtns_size,
                       error_msg,     error_msg_maxsize);
}

```

witnesscalc_auth.h

```cpp
#ifndef WITNESSCALC_AUTH_H
#define WITNESSCALC_AUTH_H


#ifdef __cplusplus
extern "C" {
#endif

#define WITNESSCALC_OK                  0x0
#define WITNESSCALC_ERROR               0x1
#define WITNESSCALC_ERROR_SHORT_BUFFER  0x2

/**
 *
 * @return error code:
 *         WITNESSCALC_OK - in case of success.
 *         WITNESSCALC_ERROR - in case of an error.
 *
 * On success wtns_buffer is filled with witness data and
 * wtns_size contains the number bytes copied to wtns_buffer.
 *
 * If wtns_buffer is too small then the function returns WITNESSCALC_ERROR_SHORT_BUFFER
 * and the minimum size for wtns_buffer in wtns_size.
 *
 */

int
witnesscalc_auth(
    const char *circuit_buffer,  unsigned long  circuit_size,
    const char *json_buffer,     unsigned long  json_size,
    char       *wtns_buffer,     unsigned long *wtns_size,
    char       *error_msg,       unsigned long  error_msg_maxsize);

#ifdef __cplusplus
}
#endif


#endif // WITNESSCALC_AUTH_H
```

8. Now let's open the CMakeLists.txt file in the same folder, there you will notice repeating pieces of code. We need to do the same, with the name of our new file

```cpp
set(AUTH_SOURCES ${LIB_SOURCES}
    auth.cpp
    witnesscalc_auth.h
    witnesscalc_auth.cpp
    )

add_library(witnesscalc_auth SHARED ${AUTH_SOURCES})
add_library(witnesscalc_authStatic STATIC ${AUTH_SOURCES})
set_target_properties(witnesscalc_authStatic PROPERTIES OUTPUT_NAME witnesscalc_auth)

add_executable(auth main.cpp)
target_link_libraries(auth witnesscalc_authStatic)

target_compile_definitions(witnesscalc_auth PUBLIC CIRCUIT_NAME=auth)
target_compile_definitions(witnesscalc_authStatic PUBLIC CIRCUIT_NAME=auth)
target_compile_definitions(auth PUBLIC CIRCUIT_NAME=auth)
```

9. Now let's go out of this folder to the root, there will be a file CMakeLists.txt, it lists the files to be compiled, find the line “install(TARGETS” and add the element `auth`, which corresponds to the name of our file, below it find the line “install(FILES” which contains elements with the file extension `.dat` and add there auth.dat, and above the line insert a comment “# [name].dat files here:” - we will need it in the future. Below that there will be a line “install(FILES” which contains elements with `.h` extension, insert there our “witnesscalc*auth.h” file. And above the line itself insert the comment “# witnesscalc*[name].h files here:” similar to above.

10. Now we can compile our static libraries

```
make android
make ios
```

In the future, you could use [this bash script](https://gist.github.com/lukachi/3162ac53cba854ef8989b1ee6729ba83) to automate this process.

You only need to follow step #5 and #6 for each new circuit. (assume you have already followed stepd #1-#3 to install all necessary stuff)

At this moment you should see in project the tree, similar to this:

```
├── CMakeLists.txt
├── COPYING
├── Makefile
├── README.md
├── build
├── build_gmp.sh
├── build_libs.sh
├── build_witnesscalc
├── build_witnesscalc_android
├── build_witnesscalc_android_x86_64
├── build_witnesscalc_ios
├── build_witnesscalc_ios_x86_64
├── cmake
├── depends
├── generate_witnesscalc_files.sh
├── package
├── package_android
├── patch_cpp.sh
├── run_tests.sh
├── src
└── testdata
```

---

## Android

Let's start from `Android` part.

We will create `.AAR` file to use it in [witnesscalculator](../modules/witnesscalculator) module.

1. Open Android Studio and create a new project.
2. Open files → new module → Android Library (You could follow official android documentation to create library)
3. `Right click` on our newly created module and select “add cpp…” (it will create cpp folder with CMakeLists.txt and `[yourName].cpp` file)
4. In `cpp` folder:
   - create folder `include` e.g. `cpp/include` and place there `witnesscalc_auth.h`
   - create folder `libs` e.g. `cpp/libs` and place there `libwitnesscalc_auth.so`
   - In CMakeLists.txt file add the following lines:

```
cmake_minimum_required(VERSION 3.22.1)

project("[yourName]")

include_directories(${CMAKE_SOURCE_DIR}/include) # path to header files
link_directories(${CMAKE_SOURCE_DIR}/libs) # path to .so files

# Add the shared library from the witnesscalc project
add_library(auth SHARED IMPORTED)
set_target_properties(auth PROPERTIES IMPORTED_LOCATION ${CMAKE_SOURCE_DIR}/libs/libwitnesscalc_auth.so)

add_library(${CMAKE_PROJECT_NAME} SHARED
    # List C/C++ source files with relative paths to this CMakeLists.txt.
    [yourName].cpp)

target_link_libraries(${CMAKE_PROJECT_NAME}
    # List libraries link to the target library
    android
    log
    auth) # name of the library
```

Move our `witnesscalc_auth.h` file to `includes` folder. And our generated `.so` file to `libs` folder.
The `.so` will be at `./build_witnesscalc_android/src/libwitnesscalc_auth.a` path in `witnesscalc` project.

5. Create a new class in the library project files, for example `WtnsUtils.kt` and add the following code:

```kotlin
package com.example.[yourName]

object WtnsUtils {
    external fun auth(
        circuitBuffer: ByteArray?,
        circuitSize: Long,
        jsonBuffer: ByteArray?,
        jsonSize: Long,
        wtnsBuffer: ByteArray?,
        wtnsSize: LongArray?,
        errorMsg: ByteArray?,
        errorMsgMaxSize: Long
    ): Int

    init {
        System.loadLibrary("[yourName]")
    }
}
```

6. `Right click` on class method and create `cpp` bindings. It will create method in `[yourName].cpp` file. And we could implement it with the following code:

```cpp
#include <jni.h>

#include "witnesscalc_auth.h"

extern "C"
JNIEXPORT jint JNICALL
Java_com_example_[yourName]_WtnsUtils_auth(JNIEnv *env, jobject thiz, jbyteArray circuit_buffer,
                                         jlong circuit_size, jbyteArray json_buffer,
                                         jlong json_size, jbyteArray wtns_buffer,
                                         jlongArray wtns_size, jbyteArray error_msg,
                                         jlong error_msg_max_size) {
    const char *circuitBuffer = reinterpret_cast<const char *>(env->GetByteArrayElements(
            circuit_buffer, nullptr));
    const char *jsonBuffer = reinterpret_cast<const char *>(env->GetByteArrayElements(json_buffer,
                                                                                      nullptr));
    char *wtnsBuffer = reinterpret_cast<char *>(env->GetByteArrayElements(wtns_buffer, nullptr));
    char *errorMsg = reinterpret_cast<char *>(env->GetByteArrayElements(error_msg, nullptr));

    unsigned long wtnsSize = env->GetLongArrayElements(wtns_size, nullptr)[0];


    int result = witnesscalc_auth(
            circuitBuffer, static_cast<unsigned long>(circuit_size),
            jsonBuffer, static_cast<unsigned long>(json_size),
            wtnsBuffer, &wtnsSize,
            errorMsg, static_cast<unsigned long>(error_msg_max_size));

    // Set the result and release the resources
    env->SetLongArrayRegion(wtns_size, 0, 1, reinterpret_cast<jlong *>(&wtnsSize));

    env->ReleaseByteArrayElements(circuit_buffer,
                                  reinterpret_cast<jbyte *>(const_cast<char *>(circuitBuffer)), 0);
    env->ReleaseByteArrayElements(json_buffer,
                                  reinterpret_cast<jbyte *>(const_cast<char *>(jsonBuffer)), 0);
    env->ReleaseByteArrayElements(wtns_buffer, reinterpret_cast<jbyte *>(wtnsBuffer), 0);
    env->ReleaseByteArrayElements(error_msg, reinterpret_cast<jbyte *>(errorMsg), 0);

    return result;
}
```

This code calculates `wtns` with provided `.dat` file bytes and `json inputs` bytes.

NOTE: your module build.gradle file should looks like this:

```gradle
plugins {
    alias(libs.plugins.android.library)
    alias(libs.plugins.jetbrains.kotlin.android)
}

android {
    namespace = "com.example.yourname"
    compileSdk = 34

    defaultConfig {
        minSdk = 27

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        consumerProguardFiles("consumer-rules.pro")
        externalNativeBuild {
            cmake {
                cppFlags += ""
            }

            ndk {
                abiFilters += "arm64-v8a"
            }
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_1_8
        targetCompatibility = JavaVersion.VERSION_1_8
    }
    kotlinOptions {
        jvmTarget = "1.8"
    }
    externalNativeBuild {
        cmake {
            path = file("src/main/cpp/CMakeLists.txt")
            version = "3.22.1"
        }
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.appcompat)
    implementation(libs.material)
    testImplementation(libs.junit)
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)
}
```

7. Finally you can run `./gradlew assembleRelease` in terminal to build your library.
8. Our `.AAR` file will be at `./build/outputs/aar` path in the library project.
9. cope file to [android/libs](../modules/witnesscalculator/android/libs). The usage you could check at [WitnesscalculatorModule.kt](../modules/witnesscalculator/android/src/main/java/expo/modules/witnesscalculator/WitnesscalculatorModule.kt) file.

## iOS

For iOS we need to create `.xcframework`.

1. In `witnesscalc` project, after we ran `make ios` we will have a `build_witnesscalc_ios` folder. This is the `xcode` project.
2. We need to compile `schemes` in this project for our architecture and platforms, e.g. `arm64` `iOS` and `arm64` `iOS Simulator`.

To do so, we could use this bash script:

build_libs.sh

```bash
#!/bin/bash

# Check if the scheme name is provided
if [ -z "$1" ]; then
  echo "Usage: $0 <scheme-name>"
  exit 1
fi

SCHEME_NAME=$1

echo "Building for iOS devices..."
sudo xcodebuild build \
  -scheme "$SCHEME_NAME" \
  -destination "generic/platform=iOS" \
  -configuration Release \
  EXCLUDED_ARCHS="x86_64"

# Check the architecture of the built .a file for iOS
IOS_LIB_PATH="src/Release-iphoneos/lib${SCHEME_NAME}.a"
if [ -f "$IOS_LIB_PATH" ]; then
  lipo -info "$IOS_LIB_PATH"
else
  echo "Warning: $IOS_LIB_PATH not found!"
fi

echo "Building for iOS Simulator..."
sudo xcodebuild build \
  -scheme "$SCHEME_NAME" \
  -destination "generic/platform=iOS Simulator" \
  -configuration Release \
  EXCLUDED_ARCHS="x86_64"

# Check the architecture of the built .a file for iOS Simulator
SIMULATOR_LIB_PATH="src/Release-iphonesimulator/lib${SCHEME_NAME}.a"
if [ -f "$SIMULATOR_LIB_PATH" ]; then
  lipo -info "$SIMULATOR_LIB_PATH"
else
  echo "Warning: $SIMULATOR_LIB_PATH not found!"
fi

echo "Build and architecture check completed for scheme: $SCHEME_NAME"

```

run the command `sudo sh ./build_libs.sh [scheme_name]`

In our case:

```bash
sudo sh ./build_libs.sh authStatic
```

and also we have to build `fr` scheme. Because it is a dependency for our authStatic scheme.

```bash
sudo sh ./build_libs.sh fr
```

Why `authStatic`?

If you open `build_witnesscalc_ios` folder in `xcode` you will see the schemes, one of them is `[our_circuit_name]Static`. This is the scheme we need to compile. Because we work with static libraries. The dynamic libraries will not work in our case.

So, after compile we should see in `src` folder under `build_witnesscalc_ios` folder:

```
src
├── Release-iphoneos
│   ├── libfr.a
│   ├── libwitnesscalc_auth.a
├── Release-iphonesimulator
│   ├── libfr.a
│   ├── libwitnesscalc_auth.a
└── cmake_install.cmake
```

we will need these `Release-iphoneos` and `Release-iphonesimulator` folders in the future. But before that we need to get the last dependency for our project.

We need to get `libgmp.a` file, located at depends/gmp/package_ios_arm64/lib/libgmp.a

Double check that this library is for our architechture:

```bash
lipo -info ./depends/gmp/package_ios_arm64/lib/libgmp.a
```

output:

```bash
Architectures in the fat file: ./depends/gmp/package_ios_arm64/lib/libgmp.a are: arm64 arm64e
```

3. Now we are ready to build our `.xcframework`.

Let's create new folder, somewhere else, for example `./witnesscalc_ios_xcframework` and create the following structure:

```bazaar
├── Release-iphoneos
│   ├── Headers
│   │   ├── witnesscalc_auth.h
│   ├── libfr.a
│   ├── libgmp.a
│   ├── libwitnesscalc_auth.a
├── Release-iphonesimulator
│   ├── Headers
│   │   ├── witnesscalc_auth.h
│   ├── libfr.a
│   ├── libgmp.a
│   ├── libwitnesscalc_auth.a
├── build_framework.sh
```

As you can see we also moved `witnesscalc_auth.h` file to `Headers` folder in both `Release-iphoneos` and `Release-iphonesimulator` folders.

`build_framework.sh` - will help us build `.xcframework` archive.

```bash
#!/bin/bash

# Define directories
DEVICES_DIR="./Release-iphoneos"
SIMULATORS_DIR="./Release-iphonesimulator"
OUTPUT_DIR="./MyProjectName.xcframework"
COMBINED_DEVICES_LIB="libCombined.a"
COMBINED_SIMULATORS_LIB="libCombined.a"

# Define the libraries and headers arrays
LIBRARIES=("libfr.a" "libgmp.a" "libwitnesscalc_auth.a") # Add libgmp.a to the array
HEADERS=("witnesscalc_auth.h") # Add witnesscalc_auth.h to the array
UMBRELLA_HEADER="MyProjectName.h"

# Define the module map name
MODULEMAP_FILE="module.modulemap"

# Function to generate umbrella header
generate_umbrella_header() {
    local OUTPUT_PATH=$1

    echo "Generating umbrella header at $OUTPUT_PATH/Headers/$UMBRELLA_HEADER..."
    cat > "$OUTPUT_PATH/Headers/$UMBRELLA_HEADER" <<EOF
#ifndef MyProjectName_h
#define MyProjectName_h

EOF

    # Include all headers in the umbrella header
    for HEADER in "${HEADERS[@]}"; do
        echo "#import \"$HEADER\"" >> "$OUTPUT_PATH/Headers/$UMBRELLA_HEADER"
    done

    echo "\n#endif /* MyProjectName_h */" >> "$OUTPUT_PATH/Headers/$UMBRELLA_HEADER"
}

# Function to generate modulemap
generate_modulemap() {
    local OUTPUT_PATH=$1
    local MODULE_NAME=$2

    # Ensure the Modules directory exists
    MODULES_DIR="$OUTPUT_PATH/Modules"
    mkdir -p $MODULES_DIR

    echo "Generating modulemap at $MODULES_DIR/$MODULEMAP_FILE..."
    cat > "$MODULES_DIR/$MODULEMAP_FILE" <<EOF
framework module $MODULE_NAME {
    umbrella header "$UMBRELLA_HEADER"
    export *
    module * { export * }
}
EOF
}

# Clean up previous build if exists
if [ -d "$OUTPUT_DIR" ]; then
    echo "Removing previous build..."
    rm -rf "$OUTPUT_DIR"
fi

echo "\n"

# Combine libraries for devices using libtool
echo "Combining libraries for devices..."
libtool -static -o $DEVICES_DIR/$COMBINED_DEVICES_LIB ${LIBRARIES[@]/#/$DEVICES_DIR/}
if [ $? -ne 0 ]; then
    echo "Failed to combine libraries for devices"
    exit 1
fi

echo "\n"

lipo -info $DEVICES_DIR/$COMBINED_DEVICES_LIB

echo "\n"

# Combine libraries for simulators using libtool
echo "Combining libraries for simulators..."
libtool -static -o $SIMULATORS_DIR/$COMBINED_SIMULATORS_LIB ${LIBRARIES[@]/#/$SIMULATORS_DIR/}
if [ $? -ne 0 ]; then
    echo "Failed to combine libraries for simulators"
    exit 1
fi

echo "\n"

lipo -info $SIMULATORS_DIR/$COMBINED_SIMULATORS_LIB

echo "\n"

# Generate umbrella headers
generate_umbrella_header $DEVICES_DIR
generate_umbrella_header $SIMULATORS_DIR

# Generate module maps
generate_modulemap $DEVICES_DIR "MyProjectName"
generate_modulemap $SIMULATORS_DIR "MyProjectName"

# Initialize the xcodebuild command
XCFRAMEWORK_CMD="xcodebuild -create-xcframework"

# Append combined device library to the xcodebuild command
XCFRAMEWORK_CMD+=" -library $DEVICES_DIR/$COMBINED_DEVICES_LIB -headers $DEVICES_DIR/Headers"

# Append combined simulator library to the xcodebuild command
XCFRAMEWORK_CMD+=" -library $SIMULATORS_DIR/$COMBINED_SIMULATORS_LIB -headers $SIMULATORS_DIR/Headers"

# Append the output directory to the xcodebuild command
XCFRAMEWORK_CMD+=" -output $OUTPUT_DIR"

# Log the command that will be executed
echo "The following command will be executed:"
echo "$XCFRAMEWORK_CMD"

echo "\n"

# Execute the command
echo "Creating XCFramework..."
eval $XCFRAMEWORK_CMD
BUILD_SUCCESS=$?

echo "\n"

# Manually copy the modulemap to the Modules directory in the .xcframework
if [ $BUILD_SUCCESS -eq 0 ]; then
    echo "Copying modulemap to XCFramework..."

    # Copy the modulemap to the appropriate directory inside the xcframework
    cp -R "$DEVICES_DIR/Modules" "$OUTPUT_DIR/ios-arm64_arm64e"
    cp -R "$SIMULATORS_DIR/Modules" "$OUTPUT_DIR/ios-arm64_arm64e-simulator"

    echo "XCFramework created successfully at $OUTPUT_DIR"

    # Clean up umbrella headers and Modules directories
    echo "Cleaning up umbrella headers and Modules directories..."
    rm -rf "$DEVICES_DIR/Headers/$UMBRELLA_HEADER"
    rm -rf "$SIMULATORS_DIR/Headers/$UMBRELLA_HEADER"
    rm -rf "$DEVICES_DIR/Modules"
    rm -rf "$SIMULATORS_DIR/Modules"

else
    echo "Failed to create XCFramework"
    exit 1
fi

echo "\n"

# Clean up combined libraries before exiting
echo "Cleaning up combined libraries..."
rm -f $DEVICES_DIR/$COMBINED_DEVICES_LIB
rm -f $SIMULATORS_DIR/$COMBINED_SIMULATORS_LIB

echo "\n"

echo "Build process completed successfully."

```

Now run:

```bash
sudo sh ./build_framework.sh
```

After that you will see `MyProjectName.xcframework` folder in the same directory.
Move it to [ios/libs](../modules/witnesscalculator/ios/libs). The usage you could check at [WtnsUtils.swift](../modules/witnesscalculator/ios/WtnsUtils.swift)
