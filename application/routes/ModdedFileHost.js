const fs = require('fs')
const path = require('path')
const express = require('express')
const router = new express.Router()

let filesBase = path.join(__dirname, '..', '..', 'files')

router.use('/', express.static(filesBase))

module.exports = router
