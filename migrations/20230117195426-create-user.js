'use strict';
const validation = require("../modules/validationModule");
const INVALID_PASSWORD_ERR = "The password is invalid. Make sure that the first one is the same as the " +
    "second and none of them are empty"
/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('User', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      fName: {
        type: Sequelize.STRING,
        validate: {
          allowNull: false,
          isAlpha: true,
          len: [3, 32]
        }
      },
      lName: {
        type: Sequelize.STRING,
        validate: {
          allowNull: false,
          isAlpha: true,
          len: [3, 32]
        }
      },
      email: {
        type: Sequelize.STRING,
        unique: true,
        validate: {
          isEmail:true,
          allowNull: false,
          notEmpty: true,
          max:32
        }
      },
      password: {
        type: Sequelize.STRING,
        validate: {
          allowNull: false,
          notEmpty: true,
          max: 32,
          isMatchingPassword: (value)=>{
            if (this.password !== this.passwordConfirm)
              throw new Error(INVALID_PASSWORD_ERR)
          }
        }
      },
      passwordConfirm: Sequelize.STRING,
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Users');
  }
};