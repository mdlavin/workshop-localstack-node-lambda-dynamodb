const AWS = require('aws-sdk');
const uuid = require('uuid/v4');

const dynamoDbClient = new AWS.DynamoDB.DocumentClient({
  endpoint: process.env.LOCALSTACK_HOSTNAME ? `http://${process.env.LOCALSTACK_HOSTNAME}:4569/` : undefined
})

exports.list = async function () {
  const result = await dynamoDbClient.scan({
    TableName: 'todos'
  }).promise();

  return result.Items;
}

exports.add = async function (todo) {
  const item = {
    id: uuid(),
    text: todo
  }
  await dynamoDbClient.put({
    TableName: 'todos',
    Item: item
  }).promise();

  return item;
}

exports.delete = async function (idToDelete) {
  const result = await dynamoDbClient.delete({
    TableName: 'todos',
    Key: {
      id: idToDelete
    }
  }).promise();

  return result;
}
