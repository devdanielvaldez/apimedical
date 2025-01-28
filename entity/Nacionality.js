const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Nacionalidad",
  tableName: "Nacionalidad",
  columns: {
    ID: {
      type: "smallint",
      primary: true,
      nullable: false,
    },
    Descripcion: {
      type: "varchar",
      length: 50,
      nullable: true,
    },
    Gentilicio: {
      type: "varchar",
      length: 50,
      nullable: true,
    },
    Estatus: {
      type: "char",
      length: 1,
      nullable: false,
    },
    Siglas: {
      type: "char",
      length: 4,
      nullable: true,
    },
  },
});
