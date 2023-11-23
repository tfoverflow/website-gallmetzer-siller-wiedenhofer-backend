const express = require('express');
const router = express.Router();

const {
  listAction,
  removeAction,
  importAction
} = require('./image.controller.js');

router.get('/', listAction);
router.get('/remove/:id', removeAction);
router.post('/import', importAction);

module.exports = router;