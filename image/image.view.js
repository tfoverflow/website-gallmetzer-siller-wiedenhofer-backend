function renderList(images) {
  return `
    <table>
      <tr><th>ID</th><th>Name</th><th>Größe</th><th>BenutzerID</th><th>Bild</th><th>Löschen</th></tr>
      ${images.map(image =>
        `<tr><td>${image.id}</td>
        <td>${image.name}</td>
        <td>${image.size}</td>
        <td>${image.uid}</td>
        <td><img src="${image.data}"</td>
        <td><a href="/movie/remove/${image.id}">Löschen</a></td>
        </tr>`).join('')}
    </table>
  `
}

module.exports = { renderList};