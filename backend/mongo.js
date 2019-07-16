const mongoose = require("mongoose");

if (process.argv.length !== 3 && process.argv.length !== 5) {
  throw Error("Error: give url as a param and maybe an item to add");
}

const url = process.argv[2];

mongoose.connect(url, { useNewUrlParser: true });

const itemSchema = new mongoose.Schema({
  name: String,
  number: String
});

const Item = mongoose.model("Item", itemSchema);

if (process.argv.length === 3) {
  console.log("phonebook:");
  Item.find({}).then(result => {
    result.forEach(item => {
      console.log(item.name, item.number);
    });
    mongoose.connection.close();
  });
  return;
}

const name = process.argv[3];
const number = process.argv[4];

const item = new Item({ name, number });

item.save().then(item => {
  console.log(`Added ${item.name} number ${item.number} to phonebook`);
  mongoose.connection.close();
});
