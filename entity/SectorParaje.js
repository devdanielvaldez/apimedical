const { EntitySchema } = require("typeorm");

const SectorParaje = new EntitySchema({
  name: "SectorParaje", // Nombre de la entidad
  tableName: "SectorParaje", // Nombre de la tabla en la base de datos
  columns: {
    ID: {
      type: "int",
      primary: true,
      generated: "increment",
      nullable: false,
    },
    IDCiudadSeccion: {
      type: "smallint",
      nullable: false,
    },
    CodigoSector: {
      type: "varchar",
      length: 4,
      nullable: true,
    },
    Descripcion: {
      type: "varchar",
      length: 70,
      nullable: true,
    },
    Estatus: {
      type: "char",
      length: 1,
      nullable: true,
    },
  },
  relations: {
    // Relación ManyToOne con la entidad CiudadSeccion
    // ciudadSeccion: {
    //   type: "many-to-one",
    //   target: "Seccion",
    //   joinColumn: { name: "IDCiudadSeccion" },
    //   nullable: false,
    // },
  },
});

module.exports = { SectorParaje };
