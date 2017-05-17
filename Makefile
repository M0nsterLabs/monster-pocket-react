NPM = npm
WEBPACK = node_modules/.bin/webpack
WEBPACK.SERVER = node_modules/.bin/webpack-dev-server
TMP.DIR = tmp
BIN = node_modules/.bin


nothing:


include etc/Makefile/Makefile.*

build: always translate
	$(NPM) run build:production

dev: translate
	$(NPM) run build:dev

demo2: translate
	$(NPM) run build:demo2

demo3: translate
	$(NPM) run build:demo3

stage: translate
	$(NPM) run build:stage

beta: translate
	$(NPM) run build:beta

build: always
	npm run build

production: always
	npm run build:production

clean:
	rm -rf build


publish:
	npm version patch
	npm publish


always:
