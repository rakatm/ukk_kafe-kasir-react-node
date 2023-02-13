'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class meja extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.transaksi,{
        foreignKey: "id_meja",
        as: "Meja"
      })
    }
  }
  meja.init({
    id_meja: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    meja: DataTypes.STRING,
    status: DataTypes.ENUM('available', 'not available'),
  }, {
    sequelize,
    modelName: 'meja',
    tableName: "meja"
  });
  return meja;
};