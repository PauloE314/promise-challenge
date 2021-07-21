const { loadPostUsers, loadPosts, main } = require("../src/index.js");

describe("'Main working' function tests", () => {
  it("'loadPosts' should return correct values", async () => {
    const response = await loadPosts(10, 10);

    expect(response.length).toBe(10);
    expect(response).toBeInstanceOf(Array);

    response.forEach((post) => {
      expect(post).toMatchObject({
        userId: expect.any(Number),
        id: expect.any(Number),
        title: expect.any(String),
        body: expect.any(String),
        comments: expect.any(Array),
      });

      post.comments.forEach((comment) => {
        expect(comment.postId).toBe(post.id);
        expect(comment).toMatchObject({
          postId: expect.any(Number),
          id: expect.any(Number),
          name: expect.any(String),
          email: expect.any(String),
          body: expect.any(String),
        });
      });
    });
  });
  // it("'loadPostUsers' should return correct values", async () => {});
  // it("'main' should return correct values", async () => {});
});
