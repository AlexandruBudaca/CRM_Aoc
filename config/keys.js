const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  mongoURI: `mongodb+srv://AlexandruBudaca:${process.env.password}@alex.njtpl.mongodb.net/${process.env.mongoCollection}?retryWrites=true&w=majority`,
};
