const express = require('express');
const router = express.Router();

const {
  listAction,
  removeAction,
  editAction,
  saveAction
} = require('./movie.controller.js');

router.get('/', listAction);
router.get('/remove/:id', removeAction);
router.get('/edit/:id?', editAction);
router.post('/save', saveAction);

module.exports = router;