require("reflect-metadata");
const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({  
  name: "Padron",
  tableName: "PADRON",
  schema: "dbo",
  columns: {
    IdProvincia: {
      type: "int",
      nullable: true,
    },
    IdMunicipio: {
      type: "int",
      nullable: true,
    },
    CodigoCircunscripcion: {
      type: "varchar",
      length: 2,
      nullable: true,
    },
    CodigoRecinto: {
      type: "varchar",
      length: 5,
      nullable: true,
    },
    colegio: {
      type: "varchar",
      length: 6,
      nullable: true,
    },
    Cedula: {
      type: "varchar",
      length: 11,
      nullable: false,
      primary: true, // La cédula es clave primaria
    },
    nombres: {
      type: "varchar",
      length: 50,
      nullable: true,
    },
    apellido1: {
      type: "varchar",
      length: 30,
      nullable: true,
    },
    apellido2: {
      type: "varchar",
      length: 30,
      nullable: true,
    },
    NombresPlastico: {
      type: "varchar",
      length: 50,
      nullable: true,
    },
    ApellidosPlastico: {
      type: "varchar",
      length: 60,
      nullable: true,
    },
    FechaNacimiento: {
      type: "datetime",
      nullable: true,
    },
    IdNacionalidad: {
      type: "int",
      nullable: true,
    },
    IdSexo: {
      type: "char",
      length: 1,
      nullable: true,
    },
    IdEstadoCivil: {
      type: "char",
      length: 1,
      nullable: true,
    },
    IdCategoria: {
      type: "int",
      nullable: true,
    },
    IdCausaCancelacion: {
      type: "int",
      nullable: true,
    },
    IdColegio: {
      type: "int",
      nullable: true,
    },
    IdColegioOrigen: {
      type: "int",
      nullable: true,
    },
    IdMunicipioOrigen: {
      type: "int",
      nullable: true,
    },
    ColegioOrigen: {
      type: "varchar",
      length: 6,
      nullable: true,
    },
    PosPagina: {
      type: "int",
      nullable: false,
    },
    LugarVotacion: {
      type: "char",
      length: 1,
      nullable: true,
    },
    IdProvinciaExterior: {
      type: "int",
      nullable: true,
    },
    IdMunicipioExterior: {
      type: "int",
      nullable: true,
    },
    CodigoRecintoExterior: {
      type: "varchar",
      length: 5,
      nullable: true,
    },
    ColegioExterior: {
      type: "varchar",
      length: 6,
      nullable: true,
    },
    PosPaginaExterior: {
      type: "int",
      nullable: true,
    },
  },
  relations: {
    provincia: {
      type: "many-to-one",
      target: "Provincia",
      joinColumn: { name: "IdProvincia" },
      nullable: true,
    },
    municipio: {
      type: "many-to-one",
      target: "Municipio",
      joinColumn: { name: "IdMunicipio" },
      nullable: true,
    },
    nacionalidad: {
      type: "many-to-one",
      target: "Nacionalidad",
      joinColumn: { name: "IdNacionalidad" },
      nullable: true,
    }
  }
});