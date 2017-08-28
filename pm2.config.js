module.exports = {
  apps : [
  {
    name        : "api-local",
    script      : "./src",
    cwd         : "./",
    "error_file": "./logs/api-local.log",
    "out_file"  : "/dev/null",
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