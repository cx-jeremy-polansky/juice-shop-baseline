# Should trigger heartbleed CVE
cmake_minimum_required(VERSION 3.10)
project(MyApp)

# Linking against vulnerable OpenSSL 1.0.1f (CVE-2014-0160 - Heartbleed)
find_package(OpenSSL 1.0.1 REQUIRED)

target_link_libraries(MyApp OpenSSL::SSL OpenSSL::Crypto)
