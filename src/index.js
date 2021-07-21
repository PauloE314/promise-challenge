const { get } = require("./utils");

const POST_AMOUNT_PER_REQUEST = 20;
const POST_AMOUNT = 20;

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

    // Creates an array of post comments
    const postCommentsPromise = postList.map((post) => {
      post.comments = [];
      return get(`/posts/${post.id}/comments`);
    });

    // Loads all comments in parallel
    const postComments = await Promise.all(postCommentsPromise);

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
    remaining -= postList.lenght;
  }

  return posts;
}

/**
 * Loads all users that have written a post
 * @param {Array} posts
 */
async function loadPostUsers(posts) {
  const userIdSet = new Set();

  posts.forEach(({ userId }) => userIdSet.add(userId));

  // Loads all users needed at once
  const userIdArray = Array.from(userIdSet);
  const users = await Promise.all(userIdArray.map((id) => get(`/users/${id}`)));

  return users;
}

/**
 * CHANLLENGE MAIN FUNCTION
 */
async function main() {
  const posts = await loadPosts(POST_AMOUNT, POST_AMOUNT_PER_REQUEST);
  const users = await loadPostUsers(posts);

  posts.forEach((post) => {
    post.user = users.find(({ id }) => id === post.userId);
  });

  return posts;
}

// Runs main function
if (require.main === module) {
  main().then((response) => console.log(response));
}

module.exports = {
  loadPostUsers,
  loadPosts,
  main,
};
