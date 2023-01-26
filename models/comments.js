'use strict';
const constants = require("../modules/constantsErrorMessageModule.js");
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
        notEmpty: {msg: `${constants.EMPTY_ERR} picture date`},
        isDate: {msg: `${constants.DATES_INVALID_FORMAT}`}
    }},
    username: {type: DataTypes.STRING,
      validate: {
        notEmpty: {msg: `${constants.EMPTY_ERR} username`},
        is: {
          args :/^[a-zA-Z]{3,32} [a-zA-Z]{3,32}$/i,
          msg: `${constants.USERNAME_ERROR}`
        }
    }},
    userid: {type: DataTypes.STRING,
      validate: {
        notEmpty: {msg: `${constants.EMPTY_ERR} user ID`},
      }},
    content: {type: DataTypes.STRING,
      validate: {
        notEmpty: {msg: `${constants.EMPTY_ERR} comment content`},
        len: {
          args:[1,128],
          msg: `content ${constants.TOO_LONG} 128`}
      }},
    deletionTime: {type: DataTypes.DATE,
      validate: {
        notEmpty: {msg: `${constants.EMPTY_ERR} deletion time`},
        isDate: {msg: `${constants.DATES_INVALID_FORMAT}`}
      }},
  }, {
    sequelize,
    modelName: 'Comments',
  });
  return Comments;
};