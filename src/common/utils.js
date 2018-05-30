const Base64 = require('js-base64').Base64
const config = require('../app-config')

const extractTokenFromUrl = url => (url.match(/token\/(.*?)\//) || [])[1]

const generateStreamFromTorrent = ({ torrent, imdbId, token }) => {
  let magnet = `magnet:?xt=urn:btih:${torrent.infoHash}`

  if (torrent.filename) {
    magnet = `${magnet}&dn=${torrent.filename}`
  }

  if (torrent.sources && torrent.sources.lenght) {
    torrent.sources.filter(s => s.startsWith('tracker')).forEach(s => {
      const tr = s.split('tracker:')[1]
      magnet = `${magnet}&tr=${s}`
    })
  }

  return [{
    isFree: false,
    tag: torrent.tag,
    url: config.generateURL({
      token,
      url: `/transfers/add?magnet=${Base64.encode(magnet)}&imdbId=${imdbId}`,
    }),
  }]
}

module.exports = {
  extractTokenFromUrl,
  generateStreamFromTorrent,
}

