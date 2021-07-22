const axios = require("axios");
const AxiosMockAdapter = require("axios-mock-adapter");
const {
  loadPostsUsers,
  loadPosts,
  loadPostsComments,
} = require("../src/index.js");
const { fakePosts, fakeComments, fakeUsers } = require("./common.js");

const postsRegex = /^\/posts\/?\?_page=(\d+)&_limit=(\d+)/;
const userRegex = /^\/users\/(\d+)/;
const commentsRegex = /^\/posts\/(\d+)\/comments/;

function getRegexNumbers(url, regex) {
  const [_, ...values] = url.match(regex);
  return values.map((value) => Number(value));
}

let mock = new AxiosMockAdapter(axios);

/**
 * Aux function that resets the axios mock implementation
 */
function resetMock() {
  mock.reset();

  mock.onGet(postsRegex).reply((config) => {
    const [_, limit] = getRegexNumbers(config.url, postsRegex);
    const response = [];

    for (let index = 0; index < limit; index++) {
      const randomIndex = Math.floor(Math.random() * fakePosts.length);
      response.push(fakePosts[randomIndex]);
    }

    return [200, response];
  });

  mock.onGet(commentsRegex).reply((config) => {
    const [id] = getRegexNumbers(config.url, commentsRegex);

    const comments = fakeComments.filter(({ postId }) => postId === id);
    return [200, comments];
  });

  mock.onGet(userRegex).reply((config) => {
    const [userId] = getRegexNumbers(config.url, userRegex);
    return [200, fakeUsers.find(({ id }) => userId === id)];
  });
}

describe("loadPostsComments", () => {
  beforeAll(resetMock);
  afterEach(() => mock.resetHistory());

  it("Returns all comments in a post list", async () => {
    const comments = await loadPostsComments(fakePosts);
    expect(comments).toBeInstanceOf(Array);
  });

  it("Calls 'get' function in each comment load", async () => {
    const comments = await loadPostsComments(fakePosts);
    expect(mock.history.get.length).toBe(comments.length);
  });

  it("Calls 'get' function with correct url", async () => {
    await loadPostsComments(fakePosts);

    mock.history.get.forEach(({ url }) => {
      const urlMatch = url.match(commentsRegex);
      expect(urlMatch).not.toBeNull();
    });
  });
});

describe("loadPosts", () => {
  const total = 40;
  const perPage = 20;

  beforeAll(resetMock);
  afterEach(() => mock.resetHistory());

  it("Returns post list", async () => {
    const postList = await loadPosts(total, perPage);
    expect(postList).toBeInstanceOf(Array);
  });

  it("Returns a list with 'total' size", async () => {
    const postList = await loadPosts(total, perPage);
    expect(postList.length).toBe(total);
  });

  it("Calls 'get' function to load every 20 posts", async () => {
    await loadPosts(total, perPage);

    const postGets = mock.history.get.filter((request) =>
      request.url.match(postsRegex)
    );
    expect(postGets.length).toBe(Math.ceil(total / perPage));
  });

  it("Calls 'get' function with correct url", async () => {
    await loadPosts(total, perPage);

    const requestHistoric = mock.history.get.filter((request) =>
      request.url.match(postsRegex)
    );

    requestHistoric.forEach(({ url }, index) => {
      const expectedUrl = `/posts?_page=${index + 1}&_limit=${perPage}`;
      expect(url).toBe(expectedUrl);
    });
  });
});

describe("loadPostsUsers", () => {
  const fakePostList = [{ userId: 1 }, { userId: 2 }, { userId: 3 }];

  beforeAll(resetMock);
  afterEach(() => mock.resetHistory());

  it("Return a user list", async () => {
    const userList = await loadPostsUsers(fakePostList);
    expect(userList).toBeInstanceOf(Array);
  });

  it("Calls 'get' function to load each user", async () => {
    await loadPostsUsers(fakePostList);
    expect(mock.history.get.length).toBe(fakePostList.length);
  });

  it("Calls 'get' function with expected urls", async () => {
    await loadPostsUsers(fakePostList);

    const expectedUrlHistoric = fakePostList.map(
      ({ userId }) => `/users/${userId}`
    );
    const urlHistoric = mock.history.get.map(({ url }) => url);

    expect(urlHistoric).toEqual(expectedUrlHistoric);
  });

  it("Prevents duplicated users", async () => {
    const fakePosts = [{ userId: 1 }, { userId: 1 }, { userId: 1 }];
    const userList = await loadPostsUsers(fakePosts);
    expect(userList.length).toBe(1);
  });
});
