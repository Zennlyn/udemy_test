import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import _ from "lodash";
import getDate from "./date.js";

const app = express();
const port = process.env.PORT || 3000;
const date = getDate();
let dayName = new Date();
dayName = dayName.toLocaleString("en-US", {weekday: "long"});

app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: true }));

const itemSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Hello"
});
const item2 = new Item({
  name: "World"
});
const item3 = new Item({
  name: "Hello World"
});
const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemSchema]
}

const List = mongoose.model('List', listSchema);

main();

// Item.insertMany(defaultItems)
//   .then(() => {console.log("Saved")})
//   .catch((err) => console.log(err));
  
app.get("/", async (req, res) => {
  await Item.find({})
    .then(items => {
      if (items.length === 0) {
        Item.insertMany(defaultItems);
      } else {
      res.render("index.ejs", { listTitle: date, newItems: items });
      }
    })
});

app.post("/", async (req, res) => {
  const itemName = req.body.newItem;
  const listName = req.body.addItem;
  console.log(listName);
  const newItem = new Item({
    name: itemName,
  });
  if (listName === date) {
    await newItem.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName})
      .then((foundList) => {
        console.log(foundList);
        foundList.items.push(newItem);
        foundList.save();
        res.redirect("/" + listName);
      })
      .catch((err) => console.log(err));
  }
});

app.post("/delete", async (req, res) => {
  const itemId = req.body.checkbox;
  const listName = req.body.listName;
  if (listName === date) {
    await Item.findByIdAndRemove(itemId)
      .then(() => res.redirect("/"))
      .catch((err) => console.log(err));
  } else {
    await List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: itemId}}})
      .then(() => res.redirect("/" + listName));
  }
});

app.get("/:title", (req, res) => {
  const title = _.capitalize(req.params.title);
  List.findOne({name: title})
    .then((result) => {
      if (!result) {
        const list = new List({
          name: title,
          items: defaultItems
        });
        list.save();
        res.redirect("/");
      } else {
        res.render("index.ejs", {listTitle: title, newItems: result.items});
      }
    })
    .catch((err) => console.log(err));
});

app.listen(port, (req, res) => {
  console.log(`Server listening on port ${port}`);
});

async function main() {
  await mongoose.connect("mongodb+srv://Zenlyn:vOcXvm5rsXz2a8V6@cluster0.rusyorp.mongodb.net/todolistDB")
    .then(() => console.log("Connected"))
    .catch(err => console.log(err));
}