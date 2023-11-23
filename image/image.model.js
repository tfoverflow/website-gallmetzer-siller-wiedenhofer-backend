const {v4: uuid} = require('uuid');

let data = [
];
function getAll() {
  return data;
}
function remove(id) {
  data = data.filter(image => image.id !== id);
}
function get(id) {
  return data.find(image => image.id === id);
}
function save(image) {
  if(image.id === '-1') {
    image.id = uuid();
    data.push(image);
  } else {
    data = data.map(item => item.id === movie.id ? movie : item);
  }
}
module.exports = { getAll, remove, get, save};