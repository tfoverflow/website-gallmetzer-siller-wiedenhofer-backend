const express = require('express');
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

const fileupload = require('express-fileupload');
app.use(fileupload());


const fileRouter = require('./file/file.router.js');
app.use('/file', fileRouter);

// Standard Error-Handler
app.use((error, request, response, next) => {
if (error.name === 'UnauthorizedError') {
  console.log(`got UnauthorizedError ${error}`)
  response.status(401).send(error);
} else
  console.log(`got another error: ${error}`)
  response.status(500).send(error);
});

app.use(express.static(__dirname));
app.listen(8080, ()=>console.log('Server listen on port 8080'));