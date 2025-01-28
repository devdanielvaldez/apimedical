require("reflect-metadata");
const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({  
  name: "Padron",
  tableName: "PADRON",
  schema: "dbo",
  columns: {
    cedula: {
      type: "varchar",
      length: 11,
      primary: true,
      name: "Cedula"
    },
    idProvincia: {
      type: "int",
      name: "IdProvincia"
    },
    idMunicipio: {
      type: "int",
      name: "IdMunicipio"
    },
    codigoCircunscripcion: {
      type: "varchar",
      length: 2,
      name: "CodigoCircunscripcion",
      nullable: true
    },
    codigoRecinto: {
      type: "varchar",
      length: 5,
      name: "CodigoRecinto",
      nullable: true
    },
    colegio: {
      type: "varchar",
      length: 6,
      name: "colegio",
      nullable: true
    },
    nombres: {
      type: "varchar",
      length: 50,
      name: "nombres",
      nullable: true
    },
    apellido1: {
      type: "varchar",
      length: 50,
      name: "apellido1",
      nullable: true
    },
    apellido2: {
      type: "varchar",
      length: 50,
      name: "apellido2",
      nullable: true
    },
    nombresPlastico: {
      type: "varchar",
      length: 100,
      name: "NombresPlastico",
      nullable: true
    },
    apellidosPlastico: {
      type: "varchar",
      length: 100,
      name: "ApellidosPlastico",
      nullable: true
    },
    fechaNacimiento: {
      type: "datetime",
      name: "FechaNacimiento",
      nullable: true
    },
    idNacionalidad: {
      type: "int",
      name: "IdNacionalidad",
      nullable: true
    },
    idSexo: {
      type: "int",
      name: "IdSexo",
      nullable: true
    },
    idEstadoCivil: {
      type: "int",
      name: "IdEstadoCivil",
      nullable: true
    },
    idCategoria: {
      type: "int",
      name: "IdCategoria",
      nullable: true
    },
    idCausaCancelacion: {
      type: "int",
      name: "IdCausaCancelacion",
      nullable: true
    },
    idColegio: {
      type: "int",
      name: "IdColegio",
      nullable: true
    },
    idColegioOrigen: {
      type: "int",
      name: "IdColegioOrigen",
      nullable: true
    },
    idMunicipioOrigen: {
      type: "int",
      name: "IdMunicipioOrigen",
      nullable: true
    },
    colegioOrigen: {
      type: "varchar",
      length: 6,
      name: "ColegioOrigen",
      nullable: true
    },
    posPagina: {
      type: "int",
      name: "PosPagina",
      nullable: true
    },
    lugarVotacion: {
      type: "varchar",
      length: 100,
      name: "LugarVotacion",
      nullable: true
    }
  },
  relations:{
    nacionalidad: {
      target: "Nacionalidad",
      type: "many-to-one",
      joinColumn: { name: "IdNacionalidad" },
      inverseSide: "id"
    },
    municipio:{
      target: "Municipio",
      type: "many-to-one",
      joinColumn: { name: "IdMunicipio" },
      inverseSide: "id"
    }
  } 
});