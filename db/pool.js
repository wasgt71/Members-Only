const { Pool } = require("pg");

// Again, this should be read from an environment variable
module.exports = new Pool({
  connectionString:
    "postgresql://tristanwassilyn:12345678@localhost:5432/users",
});
