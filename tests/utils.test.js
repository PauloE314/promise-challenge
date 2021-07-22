const axios = require("axios");
const AxiosMockAdapter = require("axios-mock-adapter");
const { get } = require("../src/utils.js");

describe("'get", () => {
  let mock = new AxiosMockAdapter(axios);

  afterEach(() => mock.resetHistory());
  beforeAll(() => mock.onAny().reply(() => [200, {}]));

  it("Calls 'axios.get' function", async () => {
    await get();
    expect(mock.history.get.length).toBe(1);
  });

  it("Calls 'axios.get' with expected parameters", async () => {
    const url = "/my-random-string";

    await get(url);
    expect(mock.history.get[0].url).toBe(url);
  });
});
