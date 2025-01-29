const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Municipio", 
  tableName: "Municipio", 
  columns: {
    ID: {
      type: "smallint",
      primary: true,
      nullable: false,
    },
    Descripcion: {
      type: "varchar",
      length: 35,
      nullable: true,
    },
    IDProvincia: {
      type: "smallint",
      nullable: false,
    },
    IDMunicipioPadre: {
      type: "smallint",
      nullable: true,
    },
    Estatus: {
      type: "varchar",
      length: 1,
      nullable: true,
    },
    DM: {
      type: "char",
      length: 1,
      nullable: true,
    },
  },
  relations: {
    // Relación ManyToOne con la entidad Provincia
    provincia: {
      type: "many-to-one",
      target: "Provincia",
      joinColumn: { name: "IDProvincia" },
      nullable: false,
    },
    // Relación ManyToOne con la misma entidad Municipio (auto-relación)
    municipioPadre: {
      type: "many-to-one",
      target: "Municipio",
      joinColumn: { name: "IDMunicipioPadre" },
      nullable: true,
    },
  },
});