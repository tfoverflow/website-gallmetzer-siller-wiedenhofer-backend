const express = require('express');
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));

const fileupload = require('express-fileupload');
app.use(fileupload());

const movieRouter = require('./movie/movie.router.js');
app.use('/movie', movieRouter);

const imageRouter = require('./image/image.router.js');
app.use('/image', imageRouter);

app.get('/', (request, response) => {
  response.redirect('/movie');
});
app.use(express.static(__dirname));
app.listen(8080, ()=>console.log('Server listen on port 8080'));