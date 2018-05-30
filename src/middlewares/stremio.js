const Stremio = require('stremio-addons')
const SearchManager = require('../common/searchManager')
const logger = require('../common/logger')
const config = require('../app-config')

const addon = new Stremio.Server({
  'stream.find': function(args, callback, user) {
    SearchManager.findStream({ args, token: user.req.token })
      .then(res => {
        logger.log('info', 'Search Manager found results', {
          token: user.req.token,
          args,
          res,
        })

        return callback(null, res || [])
      })
      .catch(err => callback(null, []))
  },
}, config.stremio.manifest)

module.exports = addon.middleware

