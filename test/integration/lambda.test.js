const AWS = require('aws-sdk');
const fs = require('fs-extra');

const lambdaClient = new AWS.Lambda({
  endpoint: process.env.AWS_LAMBDA_ENDPOINT
})

beforeAll(async () => {
  const lambda = await fs.readFile(`${__dirname}/../../build/lambda.zip`);

  // Create a Lambda for listing TODOs
  await lambdaClient.createFunction({
    Code: {
      ZipFile: lambda
    },
    FunctionName: 'todo-list',
    Handler: 'lambda.list',
    Runtime: 'nodejs8.10',
    Role: 'fake-role'
  }).promise();

  // Create a Lambda for adding TODOs
  await lambdaClient.createFunction({
    Code: {
      ZipFile: lambda
    },
    FunctionName: 'todo-add',
    Handler: 'lambda.add',
    Runtime: 'nodejs8.10',
    Role: 'fake-role'
  }).promise();

  // Create a Lambda for deleting TODOs
  await lambdaClient.createFunction({
    Code: {
      ZipFile: lambda
    },
    FunctionName: 'todo-delete',
    Handler: 'lambda.delete',
    Runtime: 'nodejs8.10',
    Role: 'fake-role'
  }).promise();

  const dyanmoDbClient = new AWS.DynamoDB({
    endpoint: process.env.AWS_DYNAMODB_ENDPOINT
  });

  await dyanmoDbClient.createTable({
    AttributeDefinitions: [
      {
        AttributeName: "id",
        AttributeType: "S"
      },
      ],
    KeySchema: [
      {
        AttributeName: "id",
        KeyType: "HASH"
      },
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 1,
      WriteCapacityUnits: 1
    },
    TableName: "todos"
  }).promise();
});

test('listing TODOs works', async () => {
  const listResult = await lambdaClient.invoke({
    FunctionName: 'todo-list',
    Payload: JSON.stringify({})
  }).promise();

  expect(listResult.StatusCode).toBe(200);
  expect(JSON.parse(listResult.Payload)).toBeInstanceOf(Array);
});

test('adding TODO works', async () => {
  const createEvent = {
    text: 'Create deletion test'
  };

  const addResult = await lambdaClient.invoke({
    FunctionName: 'todo-add',
    Payload: JSON.stringify(createEvent)
  }).promise();

  // Verify that the add returned with success
  expect(addResult.StatusCode).toBe(200);
  const addResponsePayload = JSON.parse(addResult.Payload);
  expect(addResponsePayload.id).toBeTruthy();
  expect(addResponsePayload.text).toBe(createEvent.text);

  // Verify that the item was added to the list
  const listResult = await lambdaClient.invoke({
    FunctionName: 'todo-list',
    Payload: JSON.stringify({})
  }).promise();

  expect(listResult.StatusCode).toBe(200);
  const listReponsePayload = JSON.parse(listResult.Payload);
  expect(listReponsePayload).toContainEqual({
    id: addResponsePayload.id,
    text: createEvent.text
  });
});

test('deleting a non existent TODO returns null', async () => {
  const delResult = await lambdaClient.invoke({
    FunctionName: 'todo-delete',
    Payload: JSON.stringify({
      id: 'not-real'
    })
  }).promise();

  // Verify that the add returned with success
  expect(delResult.StatusCode).toBe(200);
  const delResponsePayload = JSON.parse(delResult.Payload);
  expect(delResponsePayload).toBeNull();
});

test('deleting a TODOs works', async () => {
  // Add a TODO first, so that it can be deleted
  const createEvent = {
    text: 'This should be deleted'
  };

  const addResult = await lambdaClient.invoke({
    FunctionName: 'todo-add',
    Payload: JSON.stringify(createEvent)
  }).promise();

  // Verify that the add returned with success
  expect(addResult.StatusCode).toBe(200);
  const addResponsePayload = JSON.parse(addResult.Payload);

  // Delete the TODO entry that was just added
  const deleteResult = await lambdaClient.invoke({
    FunctionName: 'todo-delete',
    Payload: JSON.stringify({
      id: addResponsePayload.id
    })
  }).promise();

  expect(deleteResult.StatusCode).toBe(200);
  const deleteReponsePayload = JSON.parse(deleteResult.Payload);
  expect(deleteReponsePayload).toEqual({
    id: addResponsePayload.id,
    text: createEvent.text
  });

  // Verify that the item is no longer in the list
  const listResult = await lambdaClient.invoke({
    FunctionName: 'todo-list',
    Payload: JSON.stringify({})
  }).promise();

  expect(listResult.StatusCode).toBe(200);
  const listReponsePayload = JSON.parse(listResult.Payload);
  expect(listReponsePayload).not.toContainEqual({
    id: addResponsePayload.id,
    text: createEvent.text
  });
}, 10000);
