const express = require('express')
const controller = require('../controllers/auth')
const router = express.Router()

router.get('/', controller.authenticate)
router.get('/callback', controller.callback)

module.exports = router

