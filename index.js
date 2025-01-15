const express = require("express");
const mongoose = require("mongoose");
const morgan = require('morgan');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(morgan('dev'));
app.use(cors());

mongoose
    .connect("mongodb://localhost:27017/doc-appointment", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("Conectado a MongoDB"))
    .catch((err) => console.error("Error conectando a MongoDB", err));

app.use('/api', require('./router/index.routes'));

app.listen(process.env.PORT, () => console.log("Servidor corriendo en http://localhost:3030"));
