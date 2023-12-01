const express = require('express');
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));

const fileupload = require('express-fileupload');
app.use(fileupload());


const fileRouter = require('./file/file.router.js');
app.use('/file', fileRouter);

// Standard Error-Handler
app.use((error, request, response, next) => {
if (error.name === 'UnauthorizedError') {
  response.status(401).send(error);
} else
  response.status(500).send(error);
});

app.use(express.static(__dirname));
app.listen(8080, ()=>console.log('Server listen on port 8080'));