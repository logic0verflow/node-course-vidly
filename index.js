
const express = require('express');
const app = express();
const morgan = require('morgan');
const mongoose = require('mongoose');

const home = require('./routes/home');
const genres = require('./routes/genres');
const movies = require('./routes/movies');
const customers = require('./routes/customers');

app.use(express.json());
app.use(morgan('tiny'));

app.use('/', home);
app.use('/api/genres', genres);
app.use('/api/movies', movies);
app.use('/api/customers', customers);

mongoose.connect('mongodb://localhost/vidly')
  .then(() => console.log('Connected to MongoDB...'))
  .catch(err => console.error('Could not connect to MongoDB...', err));

const port  = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
