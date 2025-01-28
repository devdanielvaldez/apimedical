const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "CiudadSeccion", 
  tableName: "CiudadSeccion", 
  columns: {
    ID: {
      type: "smallint",
      primary: true,
      generated: "increment",
      nullable: false,
    },
    IDMunicipio: {
      type: "smallint",
      nullable: false,
    },
    IDDistritoMunicipal: {
      type: "smallint",
      nullable: true,
    },
    CodigoCiudad: {
      type: "varchar",
      length: 2,
      nullable: true,
    },
    Descripcion: {
      type: "varchar",
      length: 50,
      nullable: true,
    },
    Estatus: {
      type: "char",
      length: 1,
      nullable: true,
    },
  },
  relations: {
    //Relación ManyToOne con la entidad Municipio
    municipio: {
      type: "many-to-one",
      target: "Municipio",
      joinColumn: { name: "IDMunicipio" },
      nullable: false,
    },
    // Relación ManyToOne con la entidad DistritoMunicipal (no proporcionada, pero implícita)
    // distritoMunicipal: {
    //   type: "many-to-one",
    //   target: "DistritoMunicipal", // Esto debe ser reemplazado con la entidad real si la tienes
    //   joinColumn: { name: "IDDistritoMunicipal" },
    //   nullable: true,
    // },
  },
});
