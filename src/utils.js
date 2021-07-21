const axios = require("axios");

const END_POINT = "https://jsonplaceholder.typicode.com";

/**
 * Makes a get request to the END_POINT
 * @param {String} path
 * @returns {Promise}
 */
async function get(path) {
  const response = await axios.get(END_POINT + path);
  return response;
}

module.exports = { get };
