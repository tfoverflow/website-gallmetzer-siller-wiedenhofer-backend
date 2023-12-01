const fileModel = require('./file.model.js');
const fileView = require('./file.view.js');

function listAction(request, response) {
  response.send(fileView.renderList(fileModel.getAll()));
}

// No idea whether this works
function listUserAction(request, response) {
  response.send(fileView.renderUser(fileModel.getUser(request.body.uusername, request.body.upassword)))
}

function removeAction(request, response) {
  fileModel.remove(request.params.id);
  response.redirect(request.baseUrl);
}

function importAction(request, response) {
  console.log("request.files: %o", request);
  const file = {
    id: -1,
    uid: request.body.uid || -1,
    name: request.files.fileinputfield.name,
    size: request.files.fileinputfield.size,
    data: request.files.fileinputfield.data
  };
  console.log("receiving file %o", file);
  fileModel.save(file);
  response.redirect(request.baseUrl);
}
// Um JWT erstellen zu können
const jwt = require('jsonwebtoken');
// Sekunden der Lebenszeit eines Tokens
const EXPIRES_IN = 10;
const PASSWORD = 'secret';
const ALGORITHM = 'HS256';
function loginAction(request, response) {
  const ur = request.body;
  fileModel.getUser(ur.na, ur.pw)
    .then(result => {
      const jwtToken = jwt.sign({ na: result.username, id: result.id }, PASSWORD,
        { expiresIn: EXPIRES_IN, algorithm: ALGORITHM });
      response.send({ jwt: jwtToken });
    })
    .catch(error => response.status(401).send('unauthorized'));
}

module.exports = { listAction, listUserAction, removeAction, importAction, loginAction };