const { DataSource } = require("typeorm");
const padron = require("./entity/Padron");
const { config } = require('dotenv');
config();


const connection = new DataSource({
  "type": "mssql",
  "host": process.env.MSSQL_HOST_SERVER,
  "port": parseInt(process.env.MSSQL_PORT),
  "username": process.env.MSSQL_USER,
  "password": process.env.MSSQL_SA_PASSWORD,
  "database": process.env.MSSQL_DARABASE,
  "synchronize": false,
  "logging": true,
  "options": {
    "encrypt": false,
    "trustServerCertificate": true
  },
  "entities": [
    "entity/*.js" 
  ]
});

module.exports = connection;
