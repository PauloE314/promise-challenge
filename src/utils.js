const END_POINT = "https://jsonplaceholder.typicode.com";

const axios = require("axios");
axios.defaults.baseURL = END_POINT;

/**
 * Makes a get request to the END_POINT
 * @param {String} path
 * @returns {Promise}
 */
async function get(path) {
  const response = await axios.get(path);
  return response.data;
}

module.exports = { get };
