const axios = require("axios");
const AxiosMockAdapter = require("axios-mock-adapter");
const { loadPostUsers, loadPosts } = require("../src/index.js");
const { fakePosts, fakeComments, fakeUsers } = require("./common.js");

function getRegexNumbers(url, regex) {
  const [_, ...values] = url.match(regex);
  return values.map((value) => Number(value));
}

let mock = new AxiosMockAdapter(axios);

describe("'loadPosts' function tests", () => {
  const postsRegex = /^\/posts\/?\?_page=(\d+)&_limit=(\d+)/;
  const commentsRegex = /^\/posts\/(\d+)\/comments/;

  afterEach(() => mock.resetHistory());
  beforeAll(() => {
    // Mocks 'posts' behaviour
    mock.onGet(postsRegex).reply((config) => {
      const [_, limit] = getRegexNumbers(config.url, postsRegex);
      const response = [];

      for (let index = 0; index < limit; index++) {
        const randomIndex = Math.floor(Math.random() * fakePosts.length);
        response.push(fakePosts[randomIndex]);
      }

      return [200, response];
    });

    // Mocks 'comments' behaviour
    mock.onGet(commentsRegex).reply((config) => {
      const [id] = getRegexNumbers(config.url, commentsRegex);

      const comments = fakeComments.filter(({ postId }) => postId === id);
      return [200, comments];
    });
  });

  it("Should call 'get' function to load posts with correct data", async () => {
    const total = 30;
    const perPage = 10;

    const response = await loadPosts(total, perPage);
    const postGets = mock.history.get.filter((request) =>
      request.url.match(postsRegex)
    );
    const commentGets = mock.history.get.filter((request) =>
      request.url.match(commentsRegex)
    );

    expect(response).toBeInstanceOf(Array);
    expect(response.length).toBe(total);
    expect(postGets.length).toBe(Math.ceil(total / perPage));
    expect(mock.history.get.length).toBe(postGets.length + commentGets.length);

    postGets.forEach((request, index) => {
      const [page, limit] = getRegexNumbers(request.url, postsRegex);

      expect(limit).toBe(perPage);
      expect(page).toBe(index + 1);
    });

    commentGets.forEach((request) => {
      const [postId] = getRegexNumbers(request.url, commentsRegex);
      const correspondingPost = fakePosts.find(({ id }) => id === postId);

      expect(correspondingPost).not.toBeUndefined();
    });
  });
});

describe("'loadPostUsers' function tests", () => {
  const userRegex = /^\/users\/(\d+)/;

  afterEach(() => mock.resetHistory());
  beforeAll(() => {
    mock.reset();
    mock.onGet(userRegex).reply((config) => {
      const [userId] = getRegexNumbers(config.url, userRegex);
      return [200, fakeUsers.find(({ id }) => userId === id)];
    });
  });

  it("Should return the user list", async () => {
    const fakePostList = [{ userId: 1 }, { userId: 2 }, { userId: 3 }];

    const response = await loadPostUsers(fakePostList);

    expect(response.length).toBe(fakePostList.length);
    expect(mock.history.get.length).toBe(fakePostList.length);

    response.forEach((user, index) => {
      expect(mock.history.get[index].url).toBe(`/users/${user.id}`);
    });
  });

  it("Should prevent duplicated users", async () => {
    const fakePosts = [{ userId: 1 }, { userId: 1 }, { userId: 1 }];
    const userExpected = fakeUsers.find((user) => user.id === 1);

    const response = await loadPostUsers(fakePosts);

    expect(response.length).toBe(1);
    expect(mock.history.get.length).toBe(1);
    expect(response[0]).toEqual(userExpected);
  });
});
