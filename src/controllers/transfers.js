const Base64 = require('js-base64').Base64
const config = require('../app-config')
const Putio = require('../common/putio')
const db = require('../common/db')
const logger = require('../common/logger')

const add = async (req, res, next) => {
  const { query: { magnet, imdbId }, token } = req

  if (db.getLock({ token, key: imdbId })) {
    logger.log('info', '[transfer/add]: lock record found, aborting request with 429', {
      token,
      imdbId,
    })

    return res.status(429).send()
  }

  db.setLock({ token, key: imdbId })
  logger.log('info', '[transfer/add]: lock set', {
    token,
    imdbId,
  })

  // stremio bazen stream esnasinda ilk linke tekrar request atiyor,
  // bu da files/show'da lock'i remove etmis olsak bile tekrar indirmesine sebep oluyordu.
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

      db.removeLock({ token, key: imdbId })
      logger.log('info', '[transfer/add]: file record is present in our db and Put.io, removed request lock and redirecting to stream url', {
        token,
        imdbId,
        fileId,
      })

      return res.redirect(url)
    } catch (error) {
      logger.log('info', '[transfer/add]: file record is present in our db but error occured while getting from Put.io. Download flow will apply.', {
        token,
        imdbId,
        fileId,
        error,
      })
    }
  }

  let saveTo = 0

  try {
    const { id } = await Putio.setToken(token).getOrCreateTargetFolderIfNeeded()
    saveTo = id
  } catch (error) {
    logger.log('info', '[transfer/add]: unable to create folder, will save to parent', {
      token,
      error,
    })
  }

  try {
    const { data: { transfer } } = await Putio.setToken(token).Transfers.Add({
      url: Base64.decode(magnet),
      saveTo,
    })

    setTimeout(() => res.redirect(config.generateURL({
      token,
      url: `/transfers/${transfer.id}?imdbId=${imdbId}`,
    })), 5000)
  } catch (error) {
    db.removeLock({ token, key: imdbId })
    logger.log('info', '[transfer/add]: lock removed due to error', {
      token,
      imdbId,
      error,
    })

    if (error.error_type === 'Alreadyadded') {
      res.redirect(config.generateURL({
        token,
        url: `/transfers/${error.extra.existing_id}?imdbId=${imdbId}`,
      }))
    } else {
      res.status(400).send(error)
    }
  }
}

const status = async (req, res, next) => {
  const { params: { id }, query: { imdbId }, token } = req

  try {
    const { data: { transfer } } = await Putio.setToken(token).Transfers.Get(id)

    if (transfer.file_id) {
      db.removeLock({ token, key: imdbId })

      logger.log('info', '[transfer/status]: transfer completed and lock removed', {
        token,
        imdbId,
      })

      res.redirect(config.generateURL({
        token,
        url: `/files/${transfer.file_id}?imdbId=${imdbId}`,
      }))
    } else {
      setTimeout(() => res.redirect(config.generateURL({
        token,
        url: `/transfers/${id}?imdbId=${imdbId}`,
      })), 5000)
    }
  } catch (error) {
    res.status(400).send(error)
  }
}

module.exports = {
  add,
  status,
}

