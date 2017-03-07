
nothing:


include etc/Makefile/Makefile.*

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
