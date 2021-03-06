const { get } = require("./utils");

const POST_AMOUNT_PER_REQUEST = 20;
const POST_AMOUNT = 115;

/**
 * Loads a post set
 * @param {Number} page
 * @param {Number} amount
 * @returns {Promise}
 */
async function loadPosts(totalAmount, amountPerPage) {
  const posts = [];

  let page = 1;
  let remaining = totalAmount;

  while (remaining > 0) {
    const amount = Math.min(remaining, amountPerPage);

    // Loads 20 posts (or less)
    const postList = await get(`/posts?_page=${page}&_limit=${amount}`);

    // Loads post comments
    const postComments = await loadPostsComments(postList);

    // Stores comment lists in posts
    postComments.forEach((commentList) => {
      if (commentList.length > 0) {
        const post = postList.find(({ id }) => id == commentList[0].postId);

        post.comments = commentList;
      }
    });

    // Store posts
    posts.push(...postList);

    page++;
    remaining -= postList.length;
  }

  return posts;
}

/**
 * Loads all comments in a certain post
 * @param {Array} posts
 * @returns Promise<Array>
 */
async function loadPostsComments(posts) {
  const postCommentsPromise = posts.map((post) => {
    post.comments = [];
    return get(`/posts/${post.id}/comments`);
  });

  // Loads all comments in parallel and returns
  return await Promise.all(postCommentsPromise);
}

/**
 * Loads all users that have written a post
 * @param {Array} posts
 * @returns Promise<Array>
 */
async function loadPostsUsers(posts) {
  const userIdSet = new Set();

  posts.forEach(({ userId }) => userIdSet.add(userId));

  // Loads all users needed at once
  const userIdArray = Array.from(userIdSet);
  const users = await Promise.all(userIdArray.map((id) => get(`/users/${id}`)));

  return users;
}

// Runs application
if (require.main === module) {
  (async () => {
    const posts = await loadPosts(POST_AMOUNT, POST_AMOUNT_PER_REQUEST);
    const users = await loadPostsUsers(posts);

    posts.forEach((post) => {
      post.user = users.find(({ id }) => id === post.userId);
    });
  })();
}

module.exports = {
  loadPostsUsers,
  loadPosts,
  loadPostsComments,
};
