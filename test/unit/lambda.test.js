const AWS = require('aws-sdk-mock');
const sinon = require('sinon');
const uuid = require('uuid');

let deleteStub = sinon.stub();
beforeAll(function () {
  AWS.mock('DynamoDB.DocumentClient', 'delete', deleteStub);
});

test('listing TODOs pulls data from dynamodb', async () => {
  const fakeItem = {id: 'fake-id', text: 'mock-text' };
  AWS.mock('DynamoDB.DocumentClient', 'scan', sinon.stub()
    .withArgs(sinon.match({
      TableName: 'todos',
    }))
    .yields(null, {
      Items: [ fakeItem ]
    })
  );
  const lambda = require('../../src/lambda');

  const listResult = await lambda.list({}, {});
  expect(listResult).toEqual([fakeItem]);
});

test('adding TODO puts items into dynamodb', async () => {
  const createEvent = {
    text: 'Create deletion test'
  };

  AWS.mock('DynamoDB.DocumentClient', 'put', sinon.stub()
    .withArgs(sinon.match({
      TableName: 'todos',
      Item: sinon.match({
        id: sinon.match.string,
        text: createEvent.text
      })
    }))
    .yields(null, {})
  );
  const lambda = require('../../src/lambda');

  const addResult = await lambda.add(createEvent, {});

  // Verify that the add returned with success
  expect(addResult.id).toBeTruthy();
  expect(addResult.text).toBe(createEvent.text);
});

test('deleting a non existent TODO returns null', async () => {
  const itemToDelete = {
    id: 'not-real'
  }

  deleteStub
    .withArgs(sinon.match({
      TableName: 'todos',
      Key: sinon.match({
        id: itemToDelete.id
      })
    }))
    .yields(null, null)

  const lambda = require('../../src/lambda');
  const delResult = await lambda.delete({id: itemToDelete.id}, {});

  // Verify that the add returned with success
  expect(delResult).toBeNull();
});

test('deleting TODO works', async () => {
  const itemToDelete = {
    id: uuid(),
    text: 'delete this item'
  }

  deleteStub
    .withArgs(sinon.match({
      TableName: 'todos',
      Key: {
        id: itemToDelete.id
      }
    }))
    .yields(null, itemToDelete)

  const lambda = require('../../src/lambda');
  const delResult = await lambda.delete({id: itemToDelete.id}, {});

  // Verify that the add returned with success
  expect(delResult).toEqual(itemToDelete);
});
