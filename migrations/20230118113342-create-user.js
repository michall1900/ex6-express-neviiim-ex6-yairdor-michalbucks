'use strict';
const constants = require("../modules/constantsModule.js");

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      fName: {
        type: Sequelize.STRING,
        allowNull: {args: false, msg: `${constants.EMPTY_ERR} first name.`}
      },
       lName: {
         type: Sequelize.STRING,
         allowNull: {args: false, msg: `${constants.EMPTY_ERR} last name.`}
       },
      email: {
        type: Sequelize.STRING,
        unique: {args: true , msg: constants.EMAIL_EXIST_ERR},
        allowNull: {args: false, msg: `${constants.EMPTY_ERR} email.`}

      },
      password: {
        type: Sequelize.STRING,
        allowNull: {args: false, msg: `${constants.EMPTY_ERR} password.`}

      },
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