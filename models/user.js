'use strict';
const constants = require("../modules/constantsErrorMessageModule.js");
const isString  = require("../modules/utilities.js").isString
const {
  Model
} = require('sequelize');
const throwIsStringError = (obj)=>{
  if(!isString(obj))
    throw new Error(`Error, the input ${obj} ${constants.INVALID_STRING_ERROR}`)
}
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
      allowNull: false,
      unique: {args: true , msg: `${constants.EMAIL_EXIST_ERR}`},
      validate: {
        isStringValidation: throwIsStringError,
        isEmail: {msg: constants.EMAIL_ERR},
        notEmpty:{msg: `${constants.EMPTY_ERR} email.`},
        notNull:{msg: `${constants.EMPTY_ERR} email.`},
        max:{
          args:[32],
          msg:`Invalid email. ${constants.MAX_LENGTH_ERR}`
        }
      }
    },
    fName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isStringValidation: throwIsStringError,
        isAlpha: {msg:`Invalid first name ${constants.NO_ALPHA_ERR}`},
        notNull:{msg: `${constants.EMPTY_ERR} first name.`},
        len: {
          args: [3, 32],
          msg: `Invalid first name. ${constants.MIN_AND_MAX_LENGTH_ERR}`
        }
      }
    },
   lName: {
     type: DataTypes.STRING,
     allowNull: false,
     validate: {
       isStringValidation: throwIsStringError,
       isAlpha: {msg:`Invalid last name ${constants.NO_ALPHA_ERR}`},
       notNull:{msg: `${constants.EMPTY_ERR} last name.`},
       len: {
         args: [3, 32],
         msg: `Invalid last name. ${constants.MIN_AND_MAX_LENGTH_ERR}`
       }
     }
   },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isStringValidation: throwIsStringError,
        notEmpty: {msg: `${constants.EMPTY_ERR} password.`},
        notNull:{msg: `${constants.EMPTY_ERR} password.`},
        max:{
          args:[32],
          msg:`Invalid password. ${constants.MAX_LENGTH_ERR}`
        },
        isMatchingPasswords: function(value){
          //Checking if passwordConfirm defined to let validation work while login.
          if(this.passwordConfirm && this.passwordConfirm !== value)
            throw new Error(constants.INVALID_PASSWORD_ERR)
        }
      }
    },
    passwordConfirm: {
      type: DataTypes.VIRTUAL,
      allowNull: false,
      validate: {
        isStringValidation: throwIsStringError,
        notEmpty: {msg: `${constants.EMPTY_ERR} confirm password.`},
        notNull: {msg: `${constants.EMPTY_ERR} confirm password.`},
        max:{
          args:[32],
          msg:`Invalid confirm password. ${constants.MAX_LENGTH_ERR}`
        }
      }
    }
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};