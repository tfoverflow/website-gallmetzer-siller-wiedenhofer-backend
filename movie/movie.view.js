function renderList(movies) {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Filmliste</title>
        <link rel="stylesheet" href="/style.css">
      </head>
      <body>
        <table>
          <tr><th>Id</th><th>Titel</th><th>Jahr</th><th></th><th></th></tr>
          ${movies.map(movie =>
            `<tr><td>${movie.id}</td>
            <td>${movie.title}</td>
            <td>${movie.year}</td>
            <td><a href="/movie/remove/${movie.id}">Löschen</a></td>
            <td><a href="/movie/edit/${movie.id}">Ändern</a></td>
            </tr>`).join('')}
        </table>
        <a href="/movie/edit">Neu</a>
      </body>
    </html>
  `
}

function renderMovie(movie) {
  return `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Filmliste</title>
      <link rel="stylesheet" href="/style.css">
    </head>
    <body>
      <form action="/movie/save" method="post">
        <input type="hidden" name="id" value="${movie.id}">
        <div>
          <label for="title">Titel:</label>
          <input type="text" id="title" name="title" value="${movie.title}">
        </div>
        <div>
          <label for="year">Jahr:</label>
          <input type="text" id="year" name="year" value="${movie.year}">
        </div>
        <input type="submit" valie="speichern">
      </form>
    </body>
  </html>
  `;
}

module.exports = { renderList, renderMovie};