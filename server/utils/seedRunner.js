require('dotenv').config();
const connectDB = require('../config/db');
const seedAll = require('./seedData');
const mongoose = require('mongoose');

const runSeed = async () => {
  await connectDB();
  await seedAll();
  console.log('Seeding process completed. Exiting...');
  process.exit(0);
};

runSeed();
