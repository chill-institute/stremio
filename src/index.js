const app = require('express')()
const morgan = require('morgan')
const config = require('./app-config')
const logger = require('./common/logger')

// Routes
const authRoute = require('./routes/auth')
const transfersRoute = require('./routes/transfers')
const filesRoute = require('./routes/files')

// Middlewares
const authMiddleware = require('./middlewares/auth')
const stremioMiddleware = require('./middlewares/stremio')

if (!config.isProd) {
  app.use(morgan('dev'))
}

app.get('/', (req, res) => {
  res.send(`<html>
    <head>
      <style>
        html {
          background: #191919;
          color: #ddd;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
        }

        main {
          width: 100%;
          height: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
        }

        a {
          color: #FDCF45;
        }

        img {
          display: block;
          border-radius: 50%;
          width: 300px;
          height: auto;
        }

        p {
          font-size: 18px;
          margin: 0;
        }
      </style>
    </head>
    <body>
      <main>
        <img src="https://media.giphy.com/media/3o7rc0qU6m5hneMsuc/giphy.gif" />
        <h1>hello there!</h1>
        <p>please <a href='${config.appURL}/auth'>click here</a> to login with your put.io account and get customized addon url.</p>
      </main>
    </body>
  </html>`)
})

app.use('/auth', authRoute)
app.use(authMiddleware)
app.use('/token/:token/transfers', transfersRoute)
app.use('/token/:token/files', filesRoute)
app.use(stremioMiddleware)

app.listen(config.port, () => logger.log('info', 'putio addon started'))

