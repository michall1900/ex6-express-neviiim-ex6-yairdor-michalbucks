'use strict';
const constants = require("../modules/constantsModule.js");

const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  User.init({
    email: {
      type: DataTypes.STRING,
      validate: {
        isEmail: {msg: constants.EMAIL_ERR},
        notEmpty:{msg: `${constants.EMPTY_ERR} email.`},
        max:{
          args:[32],
          msg:`Invalid email. ${constants.MAX_LENGTH_ERR}`
        }
      }
    },
    fName: {
      type: DataTypes.STRING,
      validate: {
        isAlpha: {msg:`Invalid first name ${constants.NO_ALPHA_ERR}`},
        len: {
          args: [3, 32],
          msg: `Invalid first name. ${constants.MIN_AND_MAX_LENGTH_ERR}`
        }
      }
    },
   lName: {
     type: DataTypes.STRING,
     validate: {
       isAlpha: {msg:`Invalid last name ${constants.NO_ALPHA_ERR}`},
       len: {
         args: [3, 32],
         msg: `Invalid last name. ${constants.MIN_AND_MAX_LENGTH_ERR}`
       }
     }
   },
    password: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: {msg: `${constants.EMPTY_ERR} password.`},
        max:{
          args:[32],
          msg:`Invalid password. ${constants.MAX_LENGTH_ERR}`
        }
      }
    },
    passwordConfirm: {
      type: DataTypes.VIRTUAL,
      validate: {
        notEmpty: {msg: `${constants.EMPTY_ERR} password.`},
        max:{
          args:[32],
          msg:`Invalid password. ${constants.MAX_LENGTH_ERR}`
        },
        isString: (value)=>{
          if(!value.isString() || typeof value !== 'string' || this.password !== value)
            throw new Error(constants.INVALID_PASSWORD_ERR)
        }
      }
    }
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};