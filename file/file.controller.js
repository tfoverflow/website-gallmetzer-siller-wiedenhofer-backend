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
  const xlsx = require('node-xlsx');
  const fs = require('fs');

  const filePath = 'tempfiles/input.xls';

  const file = {
    uid: request.body.uid || -1,
    name: request.files.fileinputfield.name,
    size: request.files.fileinputfield.size,
    data: request.files.fileinputfield.data
  };

  fs.writeFile(filePath,file.data, (err) => { 
    if (err) 
      console.log(err); 
  });

  const excelData = xlsx.parse(fs.readFileSync(filePath));

  const firstSheet = excelData[0];

  const firstColumnData = firstSheet.data.map(row => row ? row[0] : undefined);

  firstColumnData.forEach((cellValue, rowIndex) => {
    if (cellValue !== undefined) {
        const file1 = {
          uid: rowIndex,
          name: cellValue,
          size: 0,
          data: null
        };
        file.name = cellValue;
        fileModel.save(file1);
    } 
  });
  response.redirect(request.baseUrl);
}
// Um JWT erstellen zu können
const jwt = require('jsonwebtoken');
// Sekunden der Lebenszeit eines Tokens
const EXPIRES_IN = 10000;
const PASSWORD = 'secret';
const ALGORITHM = 'HS256';
function loginAction(request, response) {
  const ur = request.body;
  console.log(`Getting request from ${ur.na}`)
  fileModel.getUser(ur.na, ur.pw)
    .then(result => {
      const jwtToken = jwt.sign({ na: result.uusername, id: result.uid }, PASSWORD,
        { expiresIn: EXPIRES_IN, algorithm: ALGORITHM });
      response.send({ jwt: jwtToken });
    })
    .catch(error => response.status(401).send('unauthorized'));
}

module.exports = { listAction, listUserAction, removeAction, importAction, loginAction };