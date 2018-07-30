const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const Fawn = require('fawn');
const { Rental, validate } = require('../models/rental.model.js');
const { Movie } = require('../models/movie.model.js');
const { Customer } = require('../models/customer.model.js');

Fawn.init(mongoose);

// Get all rentals
router.get('/', (req, res) => {
  Rental.find()
    .sort('dateOut')
    .then(rentals => res.send(rentals));
});

// Create new rental
router.post('/', async (req, res) => {

  const { error } = validate(req.body);
  if (error) return res.status(400).send(error['details'][0]['message']);

  const customer = await Customer.findById(req.body.customerId);
  if (!customer) return res.status(400).send('Customer ID not found...');

  const movie = await Movie.findById(req.body.movieId);
  if (!movie) return res.status(400).send('Movie ID not found...');

  if (movie.numberInStock === 0)
    return res.status(400).send('Unable to create rental: movie out of stock');

  let rental = new Rental({
    customer: {
      _id: customer._id,
      name: customer.name,
      phone: customer.phone
    },
    movie: {
      _id: movie._id,
      title: movie.title,
      dailyRentalRate: movie.dailyRentalRate
    }
  });

  try {
    new Fawn.Task()
      .save('rentals', rental)
      .update('movies', { _id: movie._id }, {
        $inc: { numberInStock: -1 }
      })
      .run();

    res.send(rental);
  } catch (e) {
    res.status(500).send('Something failed.');
  }
});


module.exports = router;
