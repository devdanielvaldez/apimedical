
require("dotenv").config();

const headersPrimeraARS = {
  'Content-Type': 'application/json',
  'Company': process.env.PRIMERA_ARS_COMPANY,
  'Apikey': process.env.HUMANO_PRIMERA_ARS_APIKEY,
  'Authorization': process.env.HUMANO_PRIMERA_ARS_TOKEN,
}
const headersHumanoARS = {
  ...headersPrimeraARS
}

module.exports = { headersPrimeraARS, headersHumanoARS };