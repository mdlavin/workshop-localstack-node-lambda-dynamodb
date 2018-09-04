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

exports.delete = async function (idToDelete) {
  const index = storage.findIndex(({id}) => id === idToDelete);
  if (index < 0) {
    return null;
  }

  const item = storage.splice(index, 1);
  return item;
}
