
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { Genre, validate } = require('../models/genre.model.js')
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  throw new Error('Could not get the genres.');
  Genre.find()
    .sort('name')
    .then((genres) => res.send(genres))
});

router.get('/:id', (req, res) => {
  Genre.find({ _id: req.params.id })
    .then((g) => res.send(g))
    .catch((e) => res.status(404).send('The genre with the given ID was not found.'));
});

router.post('/', auth, (req, res) => {

  // validate input
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error['details'][0]['message']);

  // if valid, add genre
  const genre = new Genre({
    name: req.body.name
  });

  genre.save()
    .then((result) => {
      console.log(result);
      res.send(genre);
    })
    .catch((e) => console.error('Save error: ', e));
});

router.put('/:id', auth, (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error);

  Genre.findByIdAndUpdate(req.params.id, {
      $set: {
        name: req.body.name
      }
    }, { new : true })
    .then((genre) => res.send(genre))
    .catch(() => res.status(404).send('The genre with the given ID was not found.'));
});

router.delete('/:id', [auth, admin], (req,res) => {
  Genre.findByIdAndRemove(req.params.id)
    .then((genre) => {
      console.log('Removed: ', genre);
      res.send(genre);
    })
    .catch(() => res.status(404).send('The genre with the given ID was not found.'))
});


module.exports = router;
