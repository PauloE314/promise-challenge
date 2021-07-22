const { loadPostUsers, loadPosts } = require("../src/index.js");
const {
  testPostShape,
  testCommentShape,
  testUserShape,
} = require("./common.js");

jest.setTimeout(300000);

describe("'loadPosts' function tests", () => {
  function testPostListShape(posts) {
    posts.forEach((post) => {
      testPostShape(post);

      expect(post.comments).toBeInstanceOf(Array);
      post.comments.forEach((comment) => testCommentShape(comment));
    });
  }

  it("Should return 10 posts", async () => {
    const response = await loadPosts(10, 10);

    expect(response.length).toBe(10);
    expect(response).toBeInstanceOf(Array);

    testPostListShape(response);
  });

  it("Should return 20 posts", async () => {
    const response = await loadPosts(20, 10);

    expect(response.length).toBe(20);
    expect(response).toBeInstanceOf(Array);

    testPostListShape(response);
  });
});

describe("'loadPostUsers' function tests", () => {
  it("Should return correct users", async () => {
    const fakePosts = [{ userId: 1 }, { userId: 2 }, { userId: 3 }];
    const response = await loadPostUsers(fakePosts);

    expect(response).toBeInstanceOf(Array);
    expect(response.length).toBe(3);
    response.forEach((user, index) => {
      testUserShape(user);
      expect(user.id).toBe(fakePosts[index].userId);
    });
  });

  it("Should prevent duplicated users", async () => {
    const fakePosts = [{ userId: 1 }, { userId: 1 }, { userId: 1 }];
    const response = await loadPostUsers(fakePosts);

    expect(response).toBeInstanceOf(Array);
    expect(response.length).toBe(1);
    testUserShape(response[0]);
    expect(response[0].id).toBe(1);
  });
});
