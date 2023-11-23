const movieModel = require('./movie.model.js');
const movieView = require('./movie.view.js');

function listAction(request, response) {
  response.send(movieView.renderList(movieModel.getAll()));
}

function removeAction(request, response) {
  movieModel.remove(request.params.id);
  response.redirect(request.baseUrl);
}

function editAction(request, response) {
  let movie = { id: '-1', title: '', year: ''};
  if (request.params.id) {
    movie = movieModel.get(request.params.id);
  }
  response.send(movieView.renderMovie(movie));
}

function saveAction(request, response) {
  const movie = {
    id: request.body.id,
    title: request.body.title,
    year: request.body.year
  };
  movieModel.save(movie);
  response.redirect(request.baseUrl);
}

module.exports = {listAction, removeAction, editAction, saveAction};