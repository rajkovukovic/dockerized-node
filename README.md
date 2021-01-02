# dockerized-node provides safe runtime for commands node | npm | yarn

`dockerized-node` runs commands `node` | `npm` | `yarn` inside a docker container to prevent bad actors from accessing your filesystem and data

## requirements
deno cli is required https://deno.land/

## install
```
git clone git@github.com:rajkovukovic/dockerized-node.git

deno install --unstable --allow-read --allow-write --allow-run --allow-env ./dockerized-node.ts
deno install --unstable --allow-read --allow-write --allow-run --allow-env ./node.ts
deno install --unstable --allow-read --allow-write --allow-run --allow-env ./npm.ts
deno install --unstable --allow-read --allow-write --allow-run --allow-env ./yarn.ts
```

## safety
`dockerized-node` needs a list of folders in which you want `node`, `npm` and `yarn` to run.  
Please note that `dockerized-node` can access all subfolders recursively.  
Never add `/` or `$HOME_DIR` to dockerized-node working dirs for safety reasons.

## run
```
dockerized-node addWorkingDir PATH_TO_DIR_WHICH_NPM_CAN_ACCESS
```

Examples
```
node --version
node index.js

npm --version
npm install
npm install lodash
npm start

yarn --version
yarn add lodash
yarn build
```

### run specific node version `node @version index.js`
```
node @14 index.js

# note that @14 refers to node's version not npm's
npm @14 start

# note that @14 refers to node's version not yarn's
yarn @14 start
```
