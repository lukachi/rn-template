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
