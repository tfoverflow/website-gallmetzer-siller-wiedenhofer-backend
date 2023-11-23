const {v4: uuid} = require('uuid');

let data = [
];
function getAll() {
  return data;
}
function remove(id) {
  data = data.filter(file => file.id !== id);
}
function get(id) {
  return data.find(file => file.id === id);
}
function save(file) {
  if(file.id === '-1') {
    file.id = uuid();
    data.push(file);
  } else {
    data = data.map(item => item.id === movie.id ? movie : item);
  }
}
module.exports = { getAll, remove, get, save};