# Should trigger heartbleed CVE
cmake_minimum_required(VERSION 3.10)
project(MyApp)

set(CMAKE_CXX_STANDARD 17)

# Pull in Conan-generated paths (openssl/1.0.1f, libpq) - run `conan install` first
list(APPEND CMAKE_PREFIX_PATH "${CMAKE_BINARY_DIR}")
list(APPEND CMAKE_MODULE_PATH "${CMAKE_BINARY_DIR}")

# Linking against vulnerable OpenSSL 1.0.1f (CVE-2014-0160 - Heartbleed)
find_package(OpenSSL REQUIRED)
find_package(libpq REQUIRED)

include_directories(${OPENSSL_INCLUDE_DIR} ${libpq_INCLUDE_DIRS} ${CMAKE_SOURCE_DIR})

add_executable(MyApp dataHandling.cpp)
target_link_libraries(MyApp OpenSSL::SSL OpenSSL::Crypto ${libpq_LIBRARIES})
