const express = require('express');
const router = express.Router();

const {
  listAction,
  removeAction,
  importAction
} = require('./file.controller.js');

router.get('/', listAction);
router.get('/remove/:id', removeAction);
router.post('/import', importAction);

module.exports = router;