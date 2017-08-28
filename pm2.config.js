module.exports = {
  apps : [
  {
    name           : "api-local",
    script         : "./src",
    cwd            : "./",
    "out_file"     : "/dev/null",
    "error_file"   : "./logs/api-local.log",
    watch          : true,
    "ignore_watch" : ["node_modules", "src/log"],
    "watch_options": {
      "followSymlinks": false
    },
    env: {
      "NODE_ENV": "development"
    },
    env_production: {
      "NODE_ENV": "production"
    },
    exec_mode   : "fork"
  }
  ]
}