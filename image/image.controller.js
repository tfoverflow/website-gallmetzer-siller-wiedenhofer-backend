const imageModel = require('./image.model.js');
const imageView = require('./image.view.js');

function listAction(request, response) {
  response.send(imageView.renderList(imageModel.getAll()));
}

function removeAction(request, response) {
  imageModel.remove(request.params.id);
  response.redirect(request.baseUrl);
}

function importAction(request, response) {
  console.log("request.files: %o", request);
  const image = {
    id: -1,
    uid: request.body.uid || -1,
    name: request.files.fileinputfield.name,
    size: request.files.fileinputfield.size,
    data: request.files.fileinputfield.data
  };
  console.log("receiving image %o", image);
  imageModel.save(image);
  response.redirect(request.baseUrl);
}

module.exports = {listAction, removeAction, importAction};