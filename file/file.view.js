function renderList(files) {
  return `
    <table>
      <tr><th>ID</th><th>Name</th><th>Montag</th><th>Dienstag</th><th>Mittwoch</th><th>Donnerstag</th><th>Freitag</th><th>Samstag</th><th>Sonntag</th></tr>
      ${files.map(file =>
        `
        <td>${file.uid}</td>
        <td>${file.name}</td>
        <td>${file.montag}</td>
        <td>${file.dienstag}</td>
        <td>${file.mittwoch}</td>
        <td>${file.donnerstag}</td>
        <td>${file.freitag}</td>
        <td>${file.samstag}</td>
        <td>${file.sonntag}</td>
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