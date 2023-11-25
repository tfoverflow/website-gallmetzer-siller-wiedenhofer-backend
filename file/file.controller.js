const fileModel = require('./file.model.js');
const fileView = require('./file.view.js');

function listAction(request, response) {
  response.send(fileView.renderList(fileModel.getAll()));
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
    id: -1,
    uid: request.body.uid || -1,
    name: request.files.fileinputfield.name,
    size: request.files.fileinputfield.size,
    data: request.files.fileinputfield.data
  };

  fs.writeFile(filePath,file.data, (err) => { 
    if (err) 
      console.log(err); 
    else { 
      console.log("File written successfully\n");  
    } 
  });

  const excelData = xlsx.parse(fs.readFileSync(filePath));

  const firstSheet = excelData[0];

  const firstColumnData = firstSheet.data.map(row => row ? row[0] : undefined);

  const namen = [];

  firstColumnData.forEach((cellValue, rowIndex) => {
    if (cellValue !== undefined) {
        console.log(`Row ${rowIndex + 1}, Column 1:`, cellValue);
        namen.push(cellValue);
    } else {
        console.log(`Row ${rowIndex + 1} is undefined`);
    }
});

  fileModel.save(file);
  response.redirect(request.baseUrl);
}

module.exports = {listAction, removeAction, importAction};