function renderList(files) {
  return `
    <table>
      <tr><th>ID</th><th>Name</th><th>Größe</th><th>BenutzerID</th><th>Bild</th><th>Löschen</th></tr>
      ${files.map(file =>
        `<tr><td>${file.id}</td>
        <td>${file.name}</td>
        <td>${file.size}</td>
        <td>${file.uid}</td>
        <td><img src="${file.data}"</td>
        <td><a href="/movie/remove/${file.id}">Löschen</a></td>
        </tr>`).join('')}
    </table>
  `
}

module.exports = { renderList};