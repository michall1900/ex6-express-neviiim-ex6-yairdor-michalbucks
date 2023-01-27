'use strict';
const constants = require("../modules/constantsErrorMessageModule.js");
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Comments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      picDate: {
        type: Sequelize.STRING,
        allowNull: {args: false, msg: `${constants.EMPTY_ERR} picture date.`}
      },
      username: {
        type: Sequelize.STRING,
        allowNull: {args: false, msg: `${constants.EMPTY_ERR} username.`}
      },
      userid: {
        type: Sequelize.STRING,
        allowNull: {args: false, msg: `${constants.EMPTY_ERR} user ID.`}
      },
      content: {
        type: Sequelize.STRING,
        allowNull: {args: false, msg: `${constants.EMPTY_ERR} comment content.`}
      },
      deletionTime: {
        type: Sequelize.DATE,
        allowNull: true
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
    await queryInterface.dropTable('Comments');
  }
};