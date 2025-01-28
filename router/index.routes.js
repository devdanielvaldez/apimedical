const routes = require('express').Router();
const Appointments = require('./appointment');
const BlockDates = require('./blockDates');
const AvailableWorkDays = require('./availableWorkDates');
const Chat = require('./chat');
const Services = require('./services');
const Patients = require('./patients');
const Insurances = require('./insurances');
const Results = require('./results');
const Turns = require('./turns');
const ClinicalHistory = require('./clinicalHistory');
const Accounting = require('./accounting');
const Users = require('./users');
const BranchOffice = require('./branchOffice');
const ProcessDocuments = require('./processDocuments');
const PersonDataAuxiliary = require('./person-data-auxiliary');

routes.use('/appointments', Appointments);
routes.use('/block-dates', BlockDates);
routes.use('/available-work-days', AvailableWorkDays);
routes.use('/chat', Chat);
routes.use('/services', Services);
routes.use('/patient', Patients);
routes.use('/insurances', Insurances);
routes.use('/results', Results);
routes.use('/turns', Turns);
routes.use('/clinical/history', ClinicalHistory);
routes.use('/accounting', Accounting);
routes.use('/auth', Users); 
routes.use('/branch-office', BranchOffice);
routes.use('/process-documents', ProcessDocuments)
routes.use('/person-data-auxiliary', PersonDataAuxiliary);

module.exports = routes;