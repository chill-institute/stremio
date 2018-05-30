const express = require('express')
const controller = require('../controllers/transfers')
const router = express.Router()

router.get('/add', controller.add)
router.get('/:id', controller.status)

module.exports = router

