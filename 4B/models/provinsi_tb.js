'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class provinsi_tb extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  provinsi_tb.init({
    nama: DataTypes.STRING,
    diresmikan: DataTypes.DATEONLY,
    photo: DataTypes.STRING,
    pulau: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'provinsi_tb',
  });
  return provinsi_tb;
};