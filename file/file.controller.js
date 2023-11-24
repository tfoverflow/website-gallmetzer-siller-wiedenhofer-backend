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
  // const reader = require('xlsx'); 
  const fs = require('fs'); 

  // console.log("request.files: %o", request);
  const file = {
    id: -1,
    uid: request.body.uid || -1,
    name: request.files.fileinputfield.name,
    size: request.files.fileinputfield.size,
    data: request.files.fileinputfield.data
  };

  fs.writeFile("tempfiles/input.xls",file.data, (err) => { 
    if (err) 
      console.log(err); 
    else { 
      console.log("File written successfully\n");  
    } 
  });

  // const fileParsed = reader.readFile(request.files.fileinputfield.mv());
  // let data = [];
  // const sheets = fileParsed.SheetNames;
  // for(let i = 0; i < sheets.length; i++) 
  // { 
  //  const temp = reader.utils.sheet_to_json( 
  //       file.Sheets[file.SheetNames[i]]) ;
  //  temp.forEach((res) => { 
  //     data.push(res) ;
  //  }) 
  // }
  // console.log("receiving file %o", file);
  // console.log(data);
  fileModel.save(file);
  response.redirect(request.baseUrl);
}

module.exports = {listAction, removeAction, importAction};