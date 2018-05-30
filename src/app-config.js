const shortid = require('shortid')
const package = require('../package.json')
const isProd = process.env.NODE_ENV === 'production'
const appURL = isProd ? 'https://stremio.chill.institute' : 'http://127.0.0.1:7000'
const id = shortid.generate()

module.exports = {
  isProd,
  port: process.env.PORT || 7000,

  appURL,
  generateURL: ({ token, url }) => `${appURL}/token/${token}${url}`,

  putio: {
    folderName: 'stremio',
    clientID: '3330',
    clientSecret: 'NYTLVKQU3KOVNMZTCATN',
  },

  stremio: {
    torrentFinderAddonURL: 'https://juan.best4stremio.space/stremioget/stremio/v1',
    manifest: {
      id: isProd ? 'org.stremio.putio' : `org.stremio.putio-dev-${id}`,
      version: package.version,
      types: ['movie', 'series'],
      idProperty: ['imdb_id'],
      filter: { 'query.imdb_id': { '$exists': true }, 'query.type': { '$in': ['series', 'movie'] } },
      name: isProd ? 'putio' : `putio-dev-${id}`,
      description: 'Putio addon for Stremio',
      icon: 'https://put.io/images/favicon-256x256.png',
      background: 'https://dzwonsemrish7.cloudfront.net/items/3g3p1V45360u343m080C/chillin_kangaroo_by_lgmvmnt_photo-d4rnet6.jpg',
      contactEmail: 'chill-institute@tutanota.com',
      isFree: false,
    }
  },

  papertrail: {
    host: 'logs3.papertrailapp.com',
    port: 40717,
  }
}

