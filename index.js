const express = require('express');
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));

const fileupload = require('express-fileupload');
app.use(fileupload());


const fileRouter = require('./file/file.router.js');
app.use('/file', fileRouter);

/*
app.get('/', (request, response) => {
  response.redirect('/movie');
});*/
app.use(express.static(__dirname));
app.listen(8080, ()=>console.log('Server listen on port 8080'));