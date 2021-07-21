const { get } = require("../src/utils.js");

describe("'get' function tests", () => {
  it("Should return a correct post list", async () => {
    const limit = 20;
    const promise = get(`/posts/?_page=1&_limit=${limit}`);

    expect(promise).toBeInstanceOf(Promise);

    const response = await promise;

    expect(response).toBeInstanceOf(Array);
    expect(response.length).toBe(limit);

    for (const post of response) {
      expect(post).toMatchObject({
        userId: expect.any(Number),
        id: expect.any(Number),
        title: expect.any(String),
        body: expect.any(String),
      });
    }
  });

  it("Should return correct user data", async () => {
    const id = 1;
    const response = await get(`/users/${id}`);

    expect(response).toMatchObject({
      id: expect.any(Number),
      name: expect.any(String),
      username: expect.any(String),
      email: expect.any(String),
      address: expect.any(Object),
      phone: expect.any(String),
      website: expect.any(String),
      company: expect.any(Object),
    });
  });

  it("Should return correct comments data", async () => {
    const id = 1;
    const response = await get(`/posts/${id}/comments`);

    expect(response).toBeInstanceOf(Array);
    response.forEach((comment) => {
      expect(comment).toMatchObject({
        id: expect.any(Number),
        postId: expect.any(Number),
        name: expect.any(String),
        email: expect.any(String),
        body: expect.any(String),
      });
    });
  });
});
