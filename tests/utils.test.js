const axios = require("axios");
const AxiosMockAdapter = require("axios-mock-adapter");
const { get } = require("../src/utils.js");
const { fakeComments, fakePosts, fakeUsers } = require("./common");

describe("'get' function tests", () => {
  let mock = new AxiosMockAdapter(axios);

  afterEach(() => mock.resetHistory());

  it("Should return a correct post list", async () => {
    const limit = 20;
    const expected = fakePosts.slice(0, limit);
    const query = `/posts/?_page=1&_limit=${limit}`;

    mock.onGet(query).replyOnce(() => [200, expected]);

    const response = await get(query);

    expect(mock.history.get.length).toBe(1);
    expect(response).toBeInstanceOf(Array);
    expect(response.length).toBeLessThanOrEqual(limit);
    expect(response).toEqual(expected);
  });

  it("Should return correct user data", async () => {
    const userId = 1;
    const expected = fakeUsers.find(({ id }) => userId === id) || {};
    const query = `/users/${userId}`;

    mock.onGet(query).replyOnce(() => [200, expected]);

    const response = await get(query);

    expect(mock.history.get.length).toBe(1);
    expect(response).toEqual(expected);
  });

  it("Should return correct comments data", async () => {
    const fakePostId = 1;
    const expected = fakeComments.filter(({ postId }) => fakePostId === postId);
    const query = `/posts/${fakePostId}/comments`;

    mock.onGet(query).replyOnce(() => [200, expected]);

    const response = await get(query);

    expect(mock.history.get.length).toBe(1);
    expect(response).toBeInstanceOf(Array);
    expect(response).toEqual(expected);
  });
});
