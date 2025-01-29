const axios = require('axios');
const router = require("express").Router();
const https = require('https');
require('dotenv').config();
const { headersPrimeraARS } = require("../utils/headers");

const agent = new https.Agent({  
  rejectUnauthorized: false
});

const dataStartPrimeraARS = async (req, res) => {
  try {
    const url = `${process.env.PRIMERA_ARS_BASE_URL}/sesion/inicio`;
    const { code_doctor } = req.body;

    console.log('=======>', headersPrimeraARS , code_doctor, process.env.PRIMERA_ARS_COMPANY, url);

    const response = await axios.post(url, {
      codigo: code_doctor
    },
    {
      headers: { ...headersPrimeraARS },
      httpsAgent: agent
    });

    if (!response?.data?.data) return res.status(404).json({
      ok: false,
      msg: "No fue posible recuperar la sesion desde Primera ARS"
    });

    console.log(response.data);
    
    const { numeroSesion } = response.data.data;

    res.status(200).json({
      ok: true,
      numeroSesion
    });

  } catch (error) {
    console.error('Error al recuperar los datos desde Primera ARS:', error);
    res.status(500).json({
      ok: false,
      msg: 'Error al recuperar los datos desde Primera ARS'
    });
  }
};

const queryInsured = async (req, res) => {
  try {
    const { numero_seguro, numero_sesion } = req.query;
    
    if (!numero_seguro) return res.status(400).json({
      ok: false,
      msg: "El número de poliza del asegurado es requerido"
    });

    if (!numero_sesion) return res.status(400).json({
      ok: false,
      msg: "El número de sesión es requerido"
    });

    const url = `${process.env.PRIMERA_ARS_BASE_URL}/asegurado/${numero_seguro}`;

    headersPrimeraARS['x-numero-sesion'] = numero_sesion

    console.log(numero_seguro, numero_sesion, headersPrimeraARS);
    
    const response = await axios.get(url,
    {
      headers: { ...headersPrimeraARS },
      httpsAgent: agent
    });

    if (!response?.data?.data) return res.status(404).json({
      ok: false,
      msg: "No fue posible recuperar la sesion desde Primera ARS"
    });

    console.log(response.data);

    res.status(200).json({
      ok: true,
      data: response.data
    });
    
  } catch (error) {
    console.error('Error al recuperar los datos del asegurado desde Primera ARS:', error);
    res.status(500).json({
      ok: false,
      msg: 'Error al recuperar los datos del asegurado desde Primera ARS'
    });
  }
};
const validateProcedure = async (req, res) => {
  try {
    const { numeroSesion, ...restBody } = req.body;
    const { codigoProcedimiento, tipoServicio, frecuencia } = restBody;
    
    if (!codigoProcedimiento) return res.status(400).json({
      ok: false,
      msg: "El código del procedimiento es requerido"
    });

    if (!tipoServicio) return res.status(400).json({
      ok: false,
      msg: "El tipo de servicio del procedimiento es requerido"
    });

    if (!frecuencia) return res.status(400).json({
      ok: false,
      msg: "La frecuencia del procedimiento es requerido"
    });

    if (!numeroSesion) return res.status(400).json({
      ok: false,
      msg: "El número de sesión es requerido"
    });

    const url = `${process.env.PRIMERA_ARS_BASE_URL}/procedimientos/validacion`;

    headersPrimeraARS['x-numero-sesion'] = numeroSesion
  
    console.log(codigoProcedimiento, tipoServicio, frecuencia, numeroSesion, headersPrimeraARS);
    
    const response = await axios.post(url,
      {
        ...restBody
      },
      {
        headers: { ...headersPrimeraARS },
        httpsAgent: agent
      }
    );

    if (!response?.data?.data) return res.status(404).json({
      ok: false,
      msg: "No fue posible recuperar los datos del procedimiento desde Primera ARS"
    });

    console.log(response.data);

    res.status(200).json({
      ok: true,
      data: response.data
    });
    
  } catch (error) {
    console.error('Error al recuperar los datos de validación del procedimiento desde Primera ARS:', error);
    res.status(500).json({
      ok: false,
      msg: 'Error al recuperar los datos de validación del procedimiento desde Primera ARS'
    });
  }
};

const procedure = async (req, res) =>{
  try {
    const { numero_sesion, frecuencia } = req.query;

    if (!numero_sesion) return res.status(400).json({
      ok: false,
      msg: "El número de sesión es requerido"
    });

    if (!frecuencia) return res.status(400).json({
      ok: false,
      msg: "La frecuencia es requerida"
    });

    const url = `${process.env.PRIMERA_ARS_BASE_URL}/procedimientos`;

    headersPrimeraARS['x-numero-sesion'] = numero_sesion;

    const response = await axios.post(url, {
        frecuencia
      },
      {
        headers: { ...headersPrimeraARS },
        httpsAgent: agent
      }
    );

    if (!response?.data?.data) return res.status(404).json({
      ok: false,
      msg: 'No fue posible recuperar los datos del procedimiento desde Primera ARS '
    });

    res.status(200).json({
      ok: true,
      data: response?.data
    });
    
  } catch (error) {
    console.error('Error al recuperar los datos del procedimiento desde Primera ARS:', error);
    res.status(500).json({
      ok: false,
      msg: 'Error al recuperar los datos del procedimiento desde Primera ARS'
    });
  }
};

const closure = async (req, res) => {
  try {
    const { numero_sesion, pre_autorizar, es_arl } = req.query;

    if (!numero_sesion) return res.status(400).json({
      ok: false,
      msg: "El número de sesión es requerido"
    });

    if (pre_autorizar == null) return res.status(400).json({
      ok: false,
      msg: "Es requerida la pre-autorización"
    });

    if (es_arl == null) return res.status(400).json({
      ok: false,
      msg: "Es requerido el campo ARL"
    });

    const url = `${process.env.PRIMERA_ARS_BASE_URL}/sesion/cierre`;

    headersPrimeraARS['x-numero-sesion'] = numero_sesion;
    console.log( numero_sesion, pre_autorizar, JSON.parse(pre_autorizar),es_arl, url, headersPrimeraARS);
    
    const response = await axios.post(url, {
        preAutorizar: JSON.parse(pre_autorizar),
        esARL: JSON.parse(es_arl)
      },
      {
        headers: { ...headersPrimeraARS },
        httpsAgent: agent
      }
    );

    if (!response?.data?.data) return res.status(404).json({
      ok: false,
      msg: 'No fue posible completar el cierre desde Primera ARS '
    });

    res.status(200).json({
      ok: true,
      data: response?.data
    });
    
  } catch (error) {
    console.error('Error al completar el cierre desde Primera ARS:', error);
    res.status(500).json({
      ok: false,
      msg: 'Error al completar el cierre desde Primera ARS'
    });
  }
};

const authorizations = async (req, res) =>{
  try {
    const { numero_sesion } = req.params;
    const url = `${process.env.PRIMERA_ARS_BASE_URL}/autorizaciones/informacion`;

    headersPrimeraARS['x-numero-sesion'] = numero_sesion;

    console.log(numero_sesion, {...req.body});
    
    
    const response = await axios.post(url, {
        ...req.body
      },
      {
        headers: { ...headersPrimeraARS },
        httpsAgent: agent
      }
    );

    if (response?.data) return res.status(404).json({
      ok: false,
      msg: 'No fue posible completar la autorización desde Primera ARS'
    });

    res.status(200).json({
      ok: true,
      data: response.data
    });
    
  } catch (error) {
    console.error('Error al completar la autorización desde Primera ARS:', error);
    if (error.status == 400){
      return res.status(400).json({
        ok: false,
        msg: error.message
      });
    }

    res.status(500).json({
      ok: false,
      msg: 'Error al completar la autorización desde Primera ARS'
    });
  }
};

const login = async (req, res) => {
  try {

    const { username, password } = req.body;
    const url = `${process.env.PRIMERA_ARS_BASE_URL}/auth/login`;
    const compania = process.env.PRIMERA_ARS_COMPANY;

    delete headersPrimeraARS.Authorization;

    console.log(headersPrimeraARS);
    
    const response = await axios.post(url, {
        username,
        password,
        compania
      },
      {
        headers: { ...headersPrimeraARS },
        httpsAgent: agent
      }
    );

  console.log(response.data);

    if (!response?.data) return res.status(404).json({
      ok: false,
      msg: 'No fue posible completar la autorización desde Primera ARS'
    });

    res.status(200).json({
      ok: true,
      data: response?.data?.data
    });
    
  } catch (error) {

    console.error('Error al realizar el login en Primera ARS:', error);

    if (error.status == 400){
      return res.status(400).json({
        ok: false,
        msg: error.message
      });
    }

    res.status(500).json({
      ok: false,
      msg: 'Error al realizar el login en Primera ARS'
    });
  }
};

router.post('/get-sesion', dataStartPrimeraARS);
router.get('/insured', queryInsured);
router.post('/validate-procedure', validateProcedure);
router.post('/procedure', procedure);
router.post('/closure', closure);
router.post('/authorizations/:numero_sesion', authorizations);
router.post('/login', login);

module.exports = router;