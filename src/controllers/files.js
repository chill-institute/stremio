const Putio = require('../common/putio')
const db = require('../common/db')
const logger = require('../common/logger')

const show = async (req, res, next) => {
  const { params: { id }, query: { imdbId }, token } = req

  try {
    const { data: { parent, files } } = await Putio.setToken(token).Files.Query(id, {
      mp4Status: 1,
      mp4StatusParent: 1,
      videoMetadata: 1,
      videoMetadataParent: 1,
      streamUrl: 1,
      streamUrlParent: 1,
      mp4StreamUrl: 1,
      mp4StreamUrlParent: 1,
    })

    let file = null

    if (parent.file_type === 'VIDEO') {
      file = parent
    } else {
      file = files.filter(file => file.file_type === 'VIDEO').sort((a, b) => b.size > a.size)[0]
    }

    if (file.need_convert) {
      return res.status(400).send({ message: 'File needs conversion' })
    }

    db.setTransfer({ token, imdbId, fileId: file.id })
    db.removeLock({ token, key: imdbId })
    logger.log('info', `[file/get]: lock removed with token: ${token}, key: ${imdbId}`)

    const url = file.mp4_stream_url ?
      `${Putio.options.baseURL}/files/${file.id}/mp4/stream?oauth_token=${token}` :
      `${Putio.options.baseURL}/files/${file.id}/stream?oauth_token=${token}`

    res.redirect(url)
  } catch (error) {
    res.send(error)
  }
}

module.exports = {
  show,
}
