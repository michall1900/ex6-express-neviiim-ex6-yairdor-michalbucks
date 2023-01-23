'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Comments extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Comments.init({
    picDate: {type: DataTypes.STRING,
      validate:{
        notEmpty: true,
        isDate: true
    }},
    username: {type: DataTypes.STRING,
      validate: {
        notEmpty: true,
        is: /^[a-zA-Z0-9]{1,24}$/i
    }},
    userid: {type: DataTypes.STRING,
      validate: {
        notEmpty: true,
      }},
    content: {type: DataTypes.STRING,
      validate: {
        notEmpty: true,
        len: [1,128]
      }},
    creationTime: {type: DataTypes.DATE,
      validate: {
        notEmpty: true,
        isDate: true
      }},
    deletionTime: {type: DataTypes.DATE,
      validate: {
        notEmpty: true,
        isDate: true
      }},
  }, {
    sequelize,
    modelName: 'Comments',
  });
  return Comments;
};