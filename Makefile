NPM = npm
WEBPACK = node_modules/.bin/webpack
WEBPACK.SERVER = node_modules/.bin/webpack-dev-server
TMP.DIR = tmp
BIN = node_modules/.bin

nothing:


include etc/Makefile/Makefile.*

$(NODE_ENV): translate
   $(NPM) run build:$(NODE_ENV)

clean:
	rm -rf build


publish:
	npm version patch
	npm publish


always:
