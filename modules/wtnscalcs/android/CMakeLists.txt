cmake_minimum_required(VERSION 3.4.1)
project(RnWtnscalcs)

set (CMAKE_VERBOSE_MAKEFILE ON)
set (CMAKE_CXX_STANDARD 14)

add_library(rn-wtnscalcs            SHARED
            ../cpp/rn-wtnscalcs.cpp
            cpp-adapter.cpp
)

# Specifies a path to native header files.
include_directories(
            ../cpp
)

link_directories(lib)

add_library(auth SHARED IMPORTED)
set_target_properties(auth PROPERTIES IMPORTED_LOCATION ${CMAKE_SOURCE_DIR}/lib/libwitnesscalc_auth.so)

target_link_libraries(rn-wtnscalcs
        android
        auth)
