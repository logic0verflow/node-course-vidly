
require('express-async-errors');
const winston = require('winston');
require('winston-mongodb');
const error = require('./middleware/error');
const config = require('config');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const express = require('express');
const app = express();
const morgan = require('morgan');
const mongoose = require('mongoose');

const home = require('./routes/home');
const genres = require('./routes/genres');
const movies = require('./routes/movies');
const rentals = require('./routes/rentals');
const customers = require('./routes/customers');
const users = require('./routes/users');
const auth = require('./routes/auth');


winston.handleExceptions(
  new winston.transports.File({ filename: 'uncaughtExceptions.log' }));

process.on('unhandledRejection', (ex) => {
  throw ex;
});

winston.add(winston.transports.File, { filename: 'logfile.log' })
winston.add(winston.transports.MongoDB, { db: 'mongodb://localhost/vidly' })

const p = Promise.reject(new Error('Promise failed HORRIBLY'));
p.then(() => console.log('done'));


if (!config.get('jwtPrivateKey')) {
  console.error('FATAL ERROR: jwtPrivateKey is not defined.');
  process.exit(1);
}

app.use(express.json());
app.use(morgan('tiny'));

app.use('/', home);
app.use('/api/genres', genres);
app.use('/api/movies', movies);
app.use('/api/rentals', rentals);
app.use('/api/customers', customers);
app.use('/api/users', users);
app.use('/api/auth', auth);
app.use(error);

mongoose.connect('mongodb://localhost/vidly')
  .then(() => console.log('Connected to MongoDB...'))
  .catch(err => console.error('Could not connect to MongoDB...', err));

const port  = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
