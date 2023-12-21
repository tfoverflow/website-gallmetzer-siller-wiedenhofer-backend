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
  const { format, addDays } = require('date-fns');
  const { utcToZonedTime } = require('date-fns-tz');

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

  const targetTimeZone = 'Europe/Rome';
  let formatedDate;
  let plan;

  firstSheet.data.forEach((row, rowIndex) => {
    if (rowIndex == 1) {
      //getting Startdate
      const XLSdate = row[6];
      const baseDate = new Date('1904-01-01');
      const parsedXLSdate = parseFloat(XLSdate, 10);
      date = addDays(baseDate, parsedXLSdate);

      const zonedDate = utcToZonedTime(date,targetTimeZone);

      formatedDate = format(zonedDate, 'yyyy-MM-dd');

      //getting UploadDate
      const uploadDatum = new Date(Date.now());
      const formatedUploadDatum = format(uploadDatum, 'yyyy-MM-dd');

      //getting XLS file
      const XLS = file.data;

      plan = {
        start: formatedDate,
        upload: formatedUploadDatum,
        xlsfile: XLS
      }

      // fileModel.saveWoche(plan);
    }
    if (rowIndex > 4 && rowIndex < 46) {
        const file1 = {
          uid: rowIndex,
          name: row[0] !== undefined ? row[0]: "",
          montag: row[1] !== undefined ? row[1]: "",
          dienstag: row[2] !== undefined ? row[2]: "",
          mittwoch: row[3] !== undefined ? row[3]: "",
          donnerstag: row[4] !== undefined ? row[4]: "",
          freitag: row[5] !== undefined ? row[5]: "",
          samstag: row[6] !== undefined ? row[6]: "",
          sonntag: row[7] !== undefined ? row[7]: "",
          size: 0,
          data: null
        };
        fileModel.save(file1,plan);
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

function statistikAction(req, res) {
  // Call getUserList from the database module
  fileModel.getUserList((error, result) => {
    if (error) {
      // console.log(error);
      res.status(500).json({ error: error });
    } else {
      res.json(result);
    }
  });
}

function getUserByID(id, res) {
  fileModel.getSpecificList(id, (error, result) => {
    if (error) {
      console.log(error);
      res.status(500).json({ error: error});
    } else {
      res.json(result);
    }
  });
}

module.exports = { listAction, listUserAction, removeAction, importAction, loginAction, statistikAction,getUserByID };