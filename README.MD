# Digial Ocean Functions - Common Utilities
A small collection of utilities that could improve the experience while writing functions.

Among the included utilities include a primitive router, some assertion utilities, debugging utilities, MySQL database utilities, etc.

## How to use?
In your NodeJS function's package.json, include a link to this Github repo: 
```json
  ...
  "dependencies": {
    "dof-common": "https://github.com/jasoryeh/digitalocean-functions-common.git"
  }
  ...
```
Do note that other ways of including these utilities such as via the `github:...` method do not work, and will time out your function build when deploying to production on the App platform.