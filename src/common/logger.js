const winston = require('winston')
require('winston-papertrail').Papertrail

const config = require('../app-config')

const transports = config.isProd ? [
  new winston.transports.Papertrail(config.papertrail),
] : [
  new (winston.transports.Console)(),
]

const logger = new winston.Logger({
  transports,
})

module.exports = logger

