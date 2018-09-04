const AWS = require('aws-sdk');
const uuid = require('uuid/v4');

const dynamoDbClient = new AWS.DynamoDB.DocumentClient({
  endpoint: process.env.AWS_DYNAMODB_ENDPOINT
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
  throw new Error('Need to implement delete!');
}
