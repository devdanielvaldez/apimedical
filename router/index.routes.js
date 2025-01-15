const routes = require('express').Router();
const Appointments = require('./appointment');
const BlockDates = require('./blockDates');
const AvailableWorkDays = require('./availableWorkDates');
const Chat = require('./chat');
const Services = require('./services')

routes.use('/appointments', Appointments);
routes.use('/block-dates', BlockDates);
routes.use('/available-work-days', AvailableWorkDays);
routes.use('/chat', Chat);
routes.use('/services', Services)

module.exports = routes;