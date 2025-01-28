
const connection = require("../connection-typeorm");
const { DataSource } = require("typeorm");
// const { Padron } = require("../entity/Padron");
const Padron = require("../entity/Padron");
const Nacionality = require("../entity/Nacionality");
const Municipaly  = require("../entity/Municipaly");
const Province  = require("../entity/Province");
const CitySection = require("../entity/CitySection");
const router = require("express").Router();

const createOrUpdatePerson = async (req, res) => {
    const queryRunner = DataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      const repositoryPadron = queryRunner.manager.getRepository(Padron);        
      const existingPerson = await repositoryPadron.findOne({ where: { cedula: req.body.cedula } });        
      const person = repositoryPadron.create({ ...req.body });        
      await repositoryPadron.upsert(person, ['cedula']);        
      await queryRunner.commitTransaction();        
      const action = existingPerson ? 'actualizados' : 'creados'; 
            
      res.status(existingPerson ? 204 : 201).json({
          ok: true,
          msg: `Datos ${action} exitosamente.`,
          person
      });
      
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error("Error al crear registrar los nuevos datos:", error);
      res.status(500).json({
          ok: false,
          msg: "Error interno del servidor.",
      });      
    }
};

const getDataAuxiliaryPersonByCedula = async (req, res) => {
  try {
    const { cedula } = req.params;    
    const repositoryPadron = connection.getRepository(Padron);
    const person = await repositoryPadron.findOne({ where: { Cedula: cedula }, relations: ["nacionalidad", "municipio","municipio.provincia"] });

    if (!person) {
      return res.status(404).json({
        ok: false,
        msg: "No se encontró la persona",
      });
    }

    res.status(200).json({
      ok: true,
      person,
    });
    
  } catch (error) {
    console.error("Error al obtener los datos de la persona:", error);
    res.status(500).json({
      ok: false,
      msg: "Error interno del servidor.",
    });
    
  }
};
const getDataAuxiliaryNacionality = async (req, res) => {
  try {
    const repositoryNacionality = connection.getRepository(Nacionality);
    const nacionality = await repositoryNacionality.find();

    if (!nacionality) {
      return res.status(404).json({
        ok: false,
        msg: "No se encontraron nacionalidades",
      });
    }

    res.status(200).json({
      ok: true,
      nacionality,
    });
    
  } catch (error) {
    console.error("Error al obtener los datos de las nacionalidades:", error);
    res.status(500).json({
      ok: false,
      msg: "Error interno del servidor.",
    });
    
  }
};
const getDataAuxiliaryProvince = async (req, res) => {
  try {
    const repositoryProvince = connection.getRepository(Province);
    const province = await repositoryProvince.find();

    if (!province) {
      return res.status(404).json({
        ok: false,
        msg: "No se encontrarón provincias",
      });
    }

    res.status(200).json({
      ok: true,
      province,
    });
    
  } catch (error) {
    console.error("Error al obtener los datos de las provincias:", error);
    res.status(500).json({
      ok: false,
      msg: "Error interno del servidor.",
    });
    
  }
};
const getDataAuxiliaryMunicipaly = async (req, res) => {
  try {
    const repositoryMunicipio = connection.getRepository(Municipaly);
    const municipaly = await repositoryMunicipio.find();

    if (!municipaly) {
      return res.status(404).json({
        ok: false,
        msg: "No se encontraron municipios",
      });
    }

    res.status(200).json({
      ok: true,
      municipio: municipaly,
    });
    
  } catch (error) {
    console.error("Error al obtener los datos de los municipios:", error);
    res.status(500).json({
      ok: false,
      msg: "Error interno del servidor.",
    });
    
  }
};

router.post("/create-or-update-person-data-auxiliary", createOrUpdatePerson);
router.get("/by-cedula/:cedula", getDataAuxiliaryPersonByCedula);
router.get("/nacionality", getDataAuxiliaryNacionality);
router.get("/municipaly", getDataAuxiliaryMunicipaly);
router.get("/province", getDataAuxiliaryProvince);

module.exports = router;