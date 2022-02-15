//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
// const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _=require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Connecting to mongoose     -------------------------------------------

mongoose.connect("mongodb+srv://admin-aleemahamed:Aleem13%40mongodbatlas@cluster0.4ykgt.mongodb.net/toDoListDB");

// ------------------Schema and Models------------------------------------
const itemsSchema = {
  name: String
};
const Item = mongoose.model("Item", itemsSchema);


// ------------------------Inserting Default Items--------------------------

const item1 = new Item({
  name: "Welcone to your to-do-list."
})
const item2 = new Item({
  name: "Hit the + button to add new item."
})
const item3 = new Item({
  name: "<-- Hit this to delete an item."
})

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

// ---------------------------------------------------------------------------


// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

app.get("/", function (req, res) {

  // const day = date.getDate();

  Item.find({}, (err, foundItems) => {
    if (err) {
      console.log(err);
    }
    else {
      if (foundItems.length === 0) {
        Item.insertMany(defaultItems, (err) => {
          if (err) {
            console.log(err);
          }
          else {
            console.log("Default Items Inserted Successfully.");
          }
        })
        res.redirect("/");
      }
      else {
        res.render("list", { listTitle: "Today", newListItems: foundItems });
      }
    }
  })



});

app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName=req.body.list;
  const item = new Item({
    name: itemName
  })
  if(listName==="Today"){
    
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:listName},(err,foundList)=>{
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    })
  }

  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});

app.post("/delete", (req, res) => {
  const checkedItem = req.body.checkbox;
  const listName=req.body.listName;

  if(listName==="Today"){
    Item.findByIdAndRemove(checkedItem, (err) => {
      if (err) {
        console.log(err);
      }
      else {
        res.redirect("/");
      }
    })
  }
  else{
    List.findOneAndUpdate({name:listName},{$pull: {items:{_id:checkedItem}}},function(err,foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    })
  }
   
})

app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({name:customListName}, (err, foundList) => {
    if(!err){
      if(!foundList){
        const list=new List({
          name:customListName,
          items:defaultItems
        });
        list.save();
        res.redirect("/"+customListName);
      }
      else{
        res.render("list",{listTitle:foundList.name,newListItems:foundList.items});
      }
    }
  })


});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(process.env.PORT || 3000, function () {
  console.log("Server started on port 3000");
});
