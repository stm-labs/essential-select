#!/usr/bin/env bash

npm install
npm run build
npm run lint

cd dist && npm link && cd ../
cd demo/essential-select-demo
npm link angular-essential-select
npm install
rm -rf node_modules/angular-essential-select
npm link angular-essential-select
npm run build

npm run test