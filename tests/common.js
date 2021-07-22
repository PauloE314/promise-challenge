function testUserShape(user) {
  expect(user).toMatchObject({
    id: expect.any(Number),
    name: expect.any(String),
    username: expect.any(String),
    email: expect.any(String),
    address: expect.any(Object),
    phone: expect.any(String),
    website: expect.any(String),
    company: expect.any(Object),
  });
}

function testPostShape(post) {
  expect(post).toMatchObject({
    userId: expect.any(Number),
    id: expect.any(Number),
    title: expect.any(String),
    body: expect.any(String),
  });
}

function testCommentShape(comment) {
  expect(comment).toMatchObject({
    id: expect.any(Number),
    postId: expect.any(Number),
    name: expect.any(String),
    email: expect.any(String),
    body: expect.any(String),
  });
}

module.exports = {
  testUserShape,
  testPostShape,
  testCommentShape,
};
