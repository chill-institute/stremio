const express = require('express')
const controller = require('../controllers/files')
const router = express.Router()

router.get('/:id', controller.show)

module.exports = router
