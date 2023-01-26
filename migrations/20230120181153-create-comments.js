'use strict';
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
        allowNull: {args: false, msg: ""}
      },
      username: {
        type: Sequelize.STRING,
        allowNull: {args: false, msg: ""}
      },
      userid: {
        type: Sequelize.STRING,
        allowNull: {args: false, msg: ""}
      },
      content: {
        type: Sequelize.STRING,
        allowNull: {args: false, msg: ""}
      },
      creationTime: {
        type: Sequelize.DATE,
        allowNull: {args: true, msg: ""}
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