const uuid = require('uuid/v4');

const storage = [];

exports.list = async function () {
  return storage;
}

exports.add = async function (todo) {
  const item = {
    id: uuid(),
    text: todo
  }
  storage.push(item);
  return item;
}
