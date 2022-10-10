test:
	sed -i 's/\"type\": \"commonjs\"/\"type\": \"module\"/' ./package.json
	npm test

start:
	sed -i 's/\"type\": \"module\"/\"type\": \"commonjs\"/' ./package.json
	npm start