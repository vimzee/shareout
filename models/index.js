"use strict";

var fs        = require("fs");
var path      = require("path");
var Sequelize = require("sequelize");
var basename  = path.basename(module.filename);
var env       = process.env.NODE_ENV || "development";

var config    = require(__dirname + '/../config/config.json')[env];
var sequelize = null;

console.log('--> ENV ' + env)

if (env == 'development'){
  console.log('--> DEV ')
  sequelize = new Sequelize(config.database, config.username, config.password, config);
} else {
  console.log('--> PRUD ')
  console.log('--> URL ' + process.env.CLEARDB_DATABASE_URL)
  sequelize = new Sequelize(process.env.CLEARDB_DATABASE_URL);
}

var db        = {};

fs
  .readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf(".") !== 0) && (file !== basename);
  })
  .forEach(function(file) {
    var model = sequelize["import"](path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(function(modelName) {
  if ("associate" in db[modelName]) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
