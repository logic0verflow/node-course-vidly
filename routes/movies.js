const express = require('express');
const router = express.Router();
const { Movie, validate } = require('../models/movie.model.js');
const { Genre } = require('../models/genre.model.js');

// Get all movies
router.get('/', (req, res) => {
  Movie.find()
    .sort('name')
    .then(movies => res.send(movies));
});

// Get a movie
router.get('/:id', (req, res) => {
  Movie.findById(req.params.id)
    .then(movie => res.send(movie))
    .catch(err => res.status(400).send('The movie with the given ID was not found...'));
});

// Create new movie
router.post('/', (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error['details'][0]['message']);

  Genre.findById(req.body.genreId)
    .then(genre => {
      const movie = new Movie ({
        title: req.body.title,
        numberInStock: req.body.numberInStock,
        dailyRentalRate: req.body.dailyRentalRate,
        genre: {
          _id: genre._id,
          name: genre.name
        }
      });

      movie.save()
        .then(movie => res.send(movie))
        .catch(err => console.error('Movie save error: ', err));
    })
    .catch(err => console.error('Error creating movie: genre not found...'));
});

// Update a movie
router.put('/:id', (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error['details'][0]['message']);

  Movie.findByIdAndUpdate(req.params.id, {
      title: req.body.title,
      genre: req.body.genre,
      numberInStock: req.body.numberInStock,
      dailyRentalRate: req.body.dailyRentalRate,
    })
    .then(result => res.send('Movie has been updated successfully...'))
    .catch(err => console.error('Movie update error: ', err));
});

// Delete a movie
router.delete('/:id', (req, res) => {
  Movie.findByIdAndRemove(req.params.id)
    .then(result => res.send('Movie was removed successfully...'))
    .catch(err => console.error('Movie delete error: ', err));
});


function createFillerMovies() {
  new Movie ({
    "title": "Spiderman",
    "numberInStock": 5,
    "dailyRentalRate": 1.99,
    "genreId": "5b57ff9835d60113e77abaa3"
  }).save();

  new Movie ({
    "title": "Scarface",
    "numberInStock": 1,
    "dailyRentalRate": 0.99,
    "genreId": "5b57ff9835d60113e77abaa3"
  }).save();

  new Movie ({
    "title": "Jurassic Park",
    "numberInStock": 0,
    "dailyRentalRate": 2.99,
    "genreId": "5b57ff9835d60113e77abaa3"
  }).save();

}

// createFillerMovies();

module.exports = router;
