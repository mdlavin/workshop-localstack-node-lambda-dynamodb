const database = require('./database');

exports.list = async function (event, context) {
  const items = await database.list();
  return items;
}

exports.add = async function (event, context) {
  const item = await database.add(event.text);
  return item;
}
