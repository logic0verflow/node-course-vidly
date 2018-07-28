
const Joi = require('joi');
const mongoose = require('mongoose');
const { genreSchema } = require('./genre.model')

const Movie = mongoose.model('Movie', new mongoose.Schema({
  title: {
    type: String,
    required: true,
    minLength: 2,
    maxLength: 255
  },
  numberInStock: {
    type: Number,
    required: true,
    min: 0,
    max: 255
  },
  dailyRentalRate: {
    type: Number,
    required: true,
    min: 0,
    max: 255
  },
  genre: {
    type: genreSchema,
    required: true
  }
}));

function validateMovie (movie) {
  const schema = {
    title: Joi.string().min(2).max(255).required(),
    numberInStock: Joi.number(),
    dailyRentalRate: Joi.number(),
    genreId: Joi.string().required()
  }

  return Joi.validate(movie, schema);
}

exports.Movie = Movie;
exports.validate = validateMovie;
