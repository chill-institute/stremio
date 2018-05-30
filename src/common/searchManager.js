const Stremio = require('stremio-addons')
const config = require('../app-config')
const db = require('./db')
const Putio = require('./putio')
const utils = require('./utils')
const logger = require('./logger')

class SearchManager {
  constructor() {
    this.stremioTorrentFinderAddon = new Stremio.Client()
    this.stremioTorrentFinderAddon.add(config.stremio.torrentFinderAddonURL)
  }

  findStreamFromAddon({ args }) {
    return new Promise((resolve, reject) => {
      this.stremioTorrentFinderAddon.stream.find(args, (err, res) => {
        if (err || !res.length) {
          reject(new Error('unable to find torrent'))
        }

        resolve(res[0])
      })
    })
  }

  async findStream({ args, token }) {
    const { query } = args

    let imdbId = `${query.imdb_id}`

    if (query.season) {
      imdbId = `${imdbId}_${query.season}`
    }

    if (query.episode) {
      imdbId = `${imdbId}_${query.episode}`
    }

    logger.log('info', 'Initiating search', {
      args,
      token,
    })

    const fileId = db.getTransfer({ token, imdbId })

    if (fileId) {
      try {
        const { data: { file } } = await Putio.setToken(token).File.Get(fileId, {
          stream_url: 1,
          mp4_stream_url: 1,
        })

        const url = file.mp4_stream_url ?
          `${Putio.options.baseURL}/files/${file.id}/mp4/stream?oauth_token=${token}` :
          `${Putio.options.baseURL}/files/${file.id}/stream?oauth_token=${token}`

        logger.log('info', 'File record is present in our db and Put.io', {
          token,
          imdbId,
          fileId,
        })

        return [{
          isFree: false,
          tag: ['hd'],
          url,
        }]
      } catch (error) {
        logger.log('info', 'File record is present in our db but error occured while getting from Put.io. Download flow will apply.', {
          token,
          imdbId,
          fileId,
          error,
        })
      }
    }

    // check if that torrent with imdb is already found
    let torrent = db.getTorrent({ imdbId })

    if (torrent) {
      logger.log('info', 'Torrent matching with this imdbId is already present in our db', {
        token,
        imdbId,
        torrent,
      })

      return utils.generateStreamFromTorrent({ token, imdbId, torrent })
    }

    // find torrent from stremio torrent finder addon
    try {
      torrent = await this.findStreamFromAddon({ args })
      db.setTorrent({ imdbId, torrent })
      logger.log('info', 'Torrent found via addon and saved to db', {
        token,
        imdbId,
        torrent,
      })

      return utils.generateStreamFromTorrent({ token, imdbId, torrent })
    } catch (error) {
      return
    }
  }
}

module.exports = new SearchManager()

