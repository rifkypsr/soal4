'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class kabupaten_tb extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  kabupaten_tb.init({
    nama: DataTypes.STRING,
    diresmikan: DataTypes.DATEONLY,
    provinsi_id: DataTypes.INTEGER,
    photo: DataTypes.STRING,
    pulau: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'kabupaten_tb',
  });
  return kabupaten_tb;
};