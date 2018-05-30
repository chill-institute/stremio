const Putio = require('../common/putio')
const utils = require('../common/utils')
const db = require('../common/db')

const auth = async (req, res, next) => {
  const token = utils.extractTokenFromUrl(req.url)

  if (token) {
    const userId = db.getUser({ token })
    req.token = token

    if (userId) {
      req.userId = userId
      return next()
    }

    try {
      const { data } = await Putio.setToken(token).User.Info()
      req.userId = db.setUser({ token, userId: data.info.user_id })
      return next()
    } catch (error) {
      return res.status(401).send({ message: 'Unauthorized' })
    }
  }

  res.status(401).send({ message: 'Unauthorized' })
}

module.exports = auth

