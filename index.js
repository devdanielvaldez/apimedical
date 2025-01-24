const express = require("express");
const mongoose = require("mongoose");
const morgan = require('morgan');
const cors = require('cors');
const { config } = require('dotenv');
const registerAppointmentsInQueueJob = require("./cronJobs/registerAppointments");
const { initWebSocket, sendNotification } = require("./socket");
config();

const app = express();
app.use(express.json());
app.use(morgan('dev'));
app.use(cors());
registerAppointmentsInQueueJob();

mongoose
    .connect("mongodb+srv://bot-jennifer:1Yi28f07c4WR5E9T@bots-de0e4e49.mongo.ondigitalocean.com/dr_jennifer?tls=true&authSource=admin&replicaSet=bots", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("Conectado a MongoDB"))
    .catch((err) => console.error("Error conectando a MongoDB", err));

app.use('/api', require('./router/index.routes'));

const server = app.listen(process.env.PORT, () => {
    console.log("Servidor corriendo en http://localhost:" + process.env.PORT);
});

initWebSocket(server);

// setTimeout(() => {
//     sendNotification("Se acaba de confirmar un turno.");
// }, 4000);
