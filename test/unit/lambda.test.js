const lambda = require('../../src/lambda');

test('adding TODO works', async () => {
  const createEvent = {
    text: 'Create deletion test'
  };
  const addResult = await lambda.add(createEvent, {});

  // Verify that the add returned with success
  expect(addResult.id).toBeTruthy();
  expect(addResult.text).toBe(createEvent.text);

  // Verify that the item was added to the list
  const listResult = await lambda.list();
  expect(listResult).toContainEqual({
    id: addResult.id,
    text: createEvent.text
  });
});

test('deleting a non existent TODO returns null', async () => {
  const delResult = await lambda.delete({id: 'not-real'}, {});

  // Verify that the add returned with success
  expect(delResult).toBeNull();
});

test('deleting TODO works', async () => {
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
