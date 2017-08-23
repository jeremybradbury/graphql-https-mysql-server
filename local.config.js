module.exports = {
  apps : [
  {
    name        : "api-local",
    script      : "./src",
    cwd         : "./",
    "error_file": "./logs/app1.err.log",
    "out_file"  : "./logs/app1.out.log",
    watch       : true,
    "ignore_watch" : ["node_modules", "src/log"],
    "watch_options": {
      "followSymlinks": false
    },
    env: {
      "NODE_ENV": "development"
    },
    env_production : {
      "NODE_ENV": "production"
    },
    exec_mode   : "fork"
  }
  ]
}