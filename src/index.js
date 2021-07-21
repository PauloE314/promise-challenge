const { get } = require("./utils");

get("/posts").then((data) => console.log(data));
