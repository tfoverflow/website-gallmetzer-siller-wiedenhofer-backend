const express = require('express');
const router = express.Router();

// Um Endpunkt absichern zu können
const { expressjwt } = require('express-jwt');
const PASSWORD = 'secret';
const ALGORITHM = 'HS256';

const {
  listAction,
  listUserAction,
  removeAction,
  importAction,
  loginAction,
  statistikAction
} = require('./file.controller.js');

router.use(function(req, res, next) {
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Origin");
  res.header("Access-Control-Allow-Origin", "*");
  next();
});
router.get('/', listAction);
router.get('/user?', expressjwt({ secret: PASSWORD, algorithms: [ ALGORITHM ] }),   listUserAction);
router.get('/remove/:id', expressjwt({ secret: PASSWORD, algorithms: [ ALGORITHM ] }), removeAction);
router.post('/import', importAction);
router.post('/login', loginAction);
router.get('/statistik', statistikAction);

module.exports = router;