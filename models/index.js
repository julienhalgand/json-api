'use strict';

const fs = require('fs'),
  path = require('path'),
  Sequelize = require('sequelize'),
  basename = path.basename(module.filename),
  env = process.env.NODE_ENV || 'test',
  config = require(__dirname + '/../config/connections.json')[env],
  db = {},
  sequelize_fixtures = require('sequelize-fixtures')

if (config.use_env_variable) {
  var sequelize = new Sequelize(process.env[config.use_env_variable])
} else {
  var sequelize = new Sequelize(config.database, config.username, config.password, config)
}
fs
  .readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js')
  })
  .forEach(function(file) {
    var model = sequelize['import'](path.join(__dirname, file))
    db[model.name] = model
  })

Object.keys(db).forEach(function(modelName) {
  if (db[modelName].associate) {
    db[modelName].associate(db)
  }
})

db.sequelize = sequelize
db.Sequelize = Sequelize
  /*
sequelize.sync({ force: true }).then(() => {
    sequelize_fixtures.loadFile(__dirname + '/../fixtures/users.json', db).then(() => {
      sequelize_fixtures.loadFile(__dirname + '/../fixtures/lists.json', db).then(() => {
        sequelize_fixtures.loadFile(__dirname + '/../fixtures/tasks.json', db)
        sequelize_fixtures.loadFile(__dirname + '/../fixtures/sharingLinks.json', db).then(() => {})
      })
    })
  })
  //*/
module.exports = db
