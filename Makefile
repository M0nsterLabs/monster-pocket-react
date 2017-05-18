NPM = npm
WEBPACK = node_modules/.bin/webpack
WEBPACK.SERVER = node_modules/.bin/webpack-dev-server
TMP.DIR = tmp
BIN = node_modules/.bin


nothing:


include etc/Makefile/Makefile.*

$(BUILDENV): translate
   $(NPM) run build:$(BUILDENV)

clean:
	rm -rf build


publish:
	npm version patch
	npm publish


always:
