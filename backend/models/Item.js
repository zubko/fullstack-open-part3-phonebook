const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
mongoose.set("useFindAndModify", false);

const url = process.env.MONGODB_URI;

console.log(`Connecting to DB ${url}...`);

mongoose
  .connect(url, { useNewUrlParser: true })
  .then(() => {
    console.log("Connected to DB");
  })
  .catch(error => {
    console.log("Error connecting to DB:", error);
  });

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    minlength: 8
  },
  number: {
    type: String,
    required: true,
    unique: true,
    match: [
      new RegExp(".*\\d".repeat(8)),
      "Number should have at least 8 digits."
    ]
  }
});

schema.plugin(uniqueValidator);

schema.set("toJSON", {
  transform: (document, returnedObject) => {
    (returnedObject.id = returnedObject._id.toString()),
      delete returnedObject._id;
    delete returnedObject.__v;
  }
});

module.exports = mongoose.model("Item", schema);
