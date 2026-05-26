import 'dotenv/config';
import mongoose from 'mongoose';
import Application from '../models/Application.js';
import CalendarEvent from '../models/CalendarEvent.js';
import Offer from '../models/Offer.js';
import PlacementDrive from '../models/PlacementDrive.js';
import Student from '../models/Student.js';
import User from '../models/User.js';
import MockTest from '../models/MockTest.js';
import MockTestSubmission from '../models/MockTestSubmission.js';

const models = [User, Student, Application, Offer, PlacementDrive, CalendarEvent, MockTest, MockTestSubmission];

const run = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is required');
  }

  await mongoose.connect(process.env.MONGODB_URI);

  for (const model of models) {
    await model.syncIndexes();
    console.log(`Indexes synced: ${model.modelName}`);
  }

  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
