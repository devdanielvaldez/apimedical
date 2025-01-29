const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Provincia",
  tableName: "Provincia", 
  columns: {
    ID: {
      type: "smallint",
      primary: true,
      nullable: false,
    },
    Descripcion: {
      type: "varchar",
      length: 30,
      nullable: true,
    },
    Estatus: {
      type: "char",
      length: 1,
      nullable: true,
    },
    ZONA: {
      type: "varchar",
      length: 2,
      nullable: true,
    },
  },
});
