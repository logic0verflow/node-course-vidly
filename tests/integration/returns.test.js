
const request = require('supertest');
const { Rental } = require('../../models/rental.model');
const { User } = require('../../models/user.model');
const { Movie } = require('../../models/movie.model');
const mongoose = require('mongoose');
const moment = require('moment');

describe('/api/returns', () => {
  let server;
  let customerId;
  let movieId;
  let rental;
  let token;

  const exec = async () => {
    return await request(server)
      .post('/api/returns')
      .set('x-auth-token', token)
      .send({ customerId, movieId });
  }

  beforeEach(async () => { 
    server = require('../../index'); 

    token = new User().generateAuthToken();
    
    customerId = mongoose.Types.ObjectId();
    movieId = mongoose.Types.ObjectId();

    const movie = new Movie({
      _id: movieId,
      title: '12345',
      dailyRentalRate: 2,
      numberInStock: 0,
      genre: { name: '54321' }
    });
    await movie.save();

    rental = new Rental({
      customer: {
        _id: customerId,
        name: '12345',
        phone: '12345'
      },
      movie: {
        _id: movieId,
        title: '12345',
        dailyRentalRate: 2
      }
    });

    await rental.save();
  });

  afterEach(async () => { 
    await server.close();
    await Rental.remove({});
    await Movie.remove({});
  });

  it('should return 401 if client is not logged in!', async () => {
    token = '';

    const res = await exec();
    
    expect(res.status).toBe(401);
  });
  
  it('should return 400 if customerId is not provided', async () => {
    customerId = '';
    
    const res = await exec();
    
    expect(res.status).toBe(400);
  });
  
  it('should return 400 if movieId is not provided', async () => {
    movieId = '';
    
    const res = await exec();
    
    expect(res.status).toBe(400);
  });

  it('should return 404 if no rental found for customer/movie', async () => {
    await Rental.remove({});
    
    const res = await exec();
    
    expect(res.status).toBe(404);
  });

  it('should return 400 if return already processed', async () => {
    rental.dateReturned = new Date();
    await rental.save();
    
    const res = await exec();
    
    expect(res.status).toBe(400);
  });
 
  it('should return 200 if request is valid', async () => {
    const res = await exec();
    
    expect(res.status).toBe(200);
  });

  it('should set the returnDate if input is valid', async () => {
    const res = await exec();

    const rentalInDB = await Rental.findById(rental._id);
    const diff = new Date() - rentalInDB.dateReturned;

    expect(diff).toBeLessThan(10 * 1000);
  });

  it('should calculate the rental fee', async () => {
    rental.dateOut = moment().subtract(3, 'days').toDate();
    await rental.save();

    const res = await exec();

    const rentalInDB = await Rental.findById(rental._id);
    
    expect(rentalInDB.rentalFee).toBe(6);
  });
  
  it('should increase the stock of returned movie', async () => {
    const res = await exec();

    const movieInDb = await Movie.findById(movieId);
    
    expect(movieInDb.numberInStock).toBe(1);
  });

  it('should return the rental if input is valid', async () => {
    const res = await exec();

    const props = Object.keys(res.body);
    const validProps = [
      'movie', 
      'customer', 
      'rentalFee',
      'dateOut',
      'dateReturned'
    ];

    expect(props).toEqual(expect.arrayContaining(validProps));
  });



});