const AWS = require('aws-sdk-mock');
const sinon = require('sinon');

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

xtest('deleting a non existent TODO returns null', async () => {

  const delResult = await lambda.delete({id: 'not-real'}, {});

  // Verify that the add returned with success
  expect(delResult).toBeNull();
});

xtest('deleting TODO works', async () => {
  const createEvent = {
    text: 'Create deletion test'
  };
  const addResult = await lambda.add(createEvent, {});

  // Verify that the add returned with success
  expect(addResult.id).toBeTruthy();
  expect(addResult.text).toBe(createEvent.text);

  const delResult = await lambda.delete({id: addResult.id}, {});

  // Verify that the item was added to the list
  const listResult = await lambda.list();
  expect(listResult).not.toContainEqual({
    id: addResult.id,
    text: createEvent.text
  });
});
