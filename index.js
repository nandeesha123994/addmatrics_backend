const app = require("./app");
require("dotenv").config();

const PORT = process.env.PORT || 5000;

// Start the Express server
app.listen(PORT, () => {
  console.log(`🚀 Addmatrics Backend running on port ${PORT}`);
  console.log(`🌐 Server URL: http://localhost:${PORT}`);
});
