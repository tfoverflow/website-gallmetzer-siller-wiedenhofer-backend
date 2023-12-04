function renderList(files) {
  return `
    <table>
      <tr><th>ID</th><th>Name</th><th>Größe</th><th>BenutzerID</th><th>Bild</th><th>Löschen</th></tr>
      ${files.map(file =>
        `<tr><td>${file.id}</td>
        <td>${namen}</td>
        <td>${file.size}</td>
        <td>${file.uid}</td>
        <td><img src="${file.data}"></td>
        <td><a href="/file/remove/${file.id}">Löschen</a></td>
        </tr>`).join('')}
    </table>
  `
}

function renderUser(user) {
  /* return `
    <table>
      <tr><th>uid</th><th>uusername</th><th>ufirstname</th><th>ulastname</th><th>upasswordhash</th></tr>
      ${users.map(user =>
        `<tr><td>${user.uid}</td>
        <td>${user.uusername}</td>
        <td>${user.ufirstname}</td>
        <td>${user.ulastname}</td>
        <td>${user.upasswordhash}"</td>
        </tr>`).join('')}
    </table>
  ` */
  return `
  uid = ${user.uid}<br>
  uusername = ${user.uusername}<br>
  ufirstname = ${user.ufirstname}<br>
  ulastname = ${user.ulastname}<br>
  upasswordhash = ${user.upasswordhash}<br>`
}

module.exports = { renderList, renderUser};