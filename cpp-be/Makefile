BUILD_DIR := build
CONAN     := $(shell which conan 2>/dev/null || echo $(shell python3 -m site --user-base)/bin/conan)

.PHONY: all clean deps conan-install cmake-configure

all: deps cmake-configure
	cmake --build $(BUILD_DIR)

deps: httplib.h

httplib.h:
	curl -fsSL \
	  https://raw.githubusercontent.com/yhirose/cpp-httplib/v0.14.3/httplib.h \
	  -o httplib.h

conan-install:
	@which conan > /dev/null 2>&1 || pip3 install conan
	mkdir -p $(BUILD_DIR)
	$(CONAN) install . --output-folder=$(BUILD_DIR) --build=missing

cmake-configure: conan-install
	cmake -S . -B $(BUILD_DIR) \
	  -DCMAKE_BUILD_TYPE=Release

clean:
	rm -rf $(BUILD_DIR) httplib.h
