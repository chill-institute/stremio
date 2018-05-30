const config = require('../app-config')
const Putio = require('../common/putio')
const utils = require('../common/utils')

const authenticate = (req, res, next) => {
  const loginURL = Putio.getLoginURL({
    redirectURI: `${config.appURL}/auth/callback`,
    responseType: 'code',
  })

  res.redirect(loginURL)
}

const callback = async (req, res, next) => {
  const { query } = req

  if (!query.code) {
    return res.status(401).send({ message: 'No code found in url' })
  }

  try {
    const { data } = await Putio.setToken('')
      .Requester
      .get(`/oauth2/access_token`)
      .query({
        client_id: config.putio.clientID,
        client_secret: config.putio.clientSecret,
        grant_type: 'authorization_code',
        redirect_uri: `${config.appURL}/auth/callback`,
        code: query.code,
      })
      .end()

    return res.redirect(config.generateURL({
      token: data.access_token,
      url: '/',
    }))
  } catch (error) {
    return res.status(401).send({ message: 'Invalid code' })
  }
}

module.exports = {
  authenticate,
  callback,
}

