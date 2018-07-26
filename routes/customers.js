
const { Customer, validate } = require('../models/customer.model.js');
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  Customer.find()
    .sort('name')
    .then(customers => res.send(customers));
});

router.get('/:id', (req, res) => {
  Customer.findById(req.params.id)
    .then(c => res.send(c))
    .catch(e => res.status(404).send('The customer with the given ID was not found.'));
});

router.post('/', (req, res) => {
  // validate input
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error['details'][0]['message']);

  // if valid, add customer
  const customer = new Customer(req.body);

  customer.save()
    .then(result => {
      console.log(result);
      res.send(customer);
    })
    .catch(e => console.error('Save error: ', e));
});

router.put('/:id', (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error);

  let updates = {};
  if (req.body.name) updates.name = req.body.name;
  if (req.body.phone) updates.phone = req.body.phone;
  if (req.body.isGold) updates.isGold = req.body.isGold;

  Customer.findByIdAndUpdate(req.params.id, {
      $set: updates
    }, { new : true })
    .then(customer => res.send(customer))
    .catch(() => res.status(404).send('The customer with the given ID was not found.'));
});

router.delete('/:id', (req,res) => {
  Customer.findByIdAndRemove(req.params.id)
    .then(customer => {
      console.log('Removed: ', customer);
      res.send(customer);
    })
    .catch(() => res.status(404).send('The customer with the given ID was not found.'))
});


module.exports = router;
