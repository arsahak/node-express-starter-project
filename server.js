const app = require("./app");
const { serverPort } = require("./secret");

app.listen(serverPort, async () => {
  console.log(`Server is running at http://localhost:8000`);

});

