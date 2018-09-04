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
});

test('listing TODOs works', async () => {
  const listResult = await lambdaClient.invoke({
    FunctionName: 'todo-list'
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
    FunctionName: 'todo-list'
  }).promise();

  expect(listResult.StatusCode).toBe(200);
  const listReponsePayload = JSON.parse(listResult.Payload);
  expect(listReponsePayload).toContainEqual({
    id: addResult.id,
    text: createEvent.text
  });
});
