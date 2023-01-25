//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const _ = require('lodash');

const mongoose=require("mongoose");
const { constant } = require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://PawanJaat:Pawan9416@cluster0.tinczw5.mongodb.net/todolistDB",{useNewUrlParser:true});
const itemsSchema= {
  name:String
}
const Item=new mongoose.model("Item",itemsSchema);
const item1= new Item({name:"Welcome to your toDo List!"});
const item2=new Item({name:"Hit the + buttonto aff a new item"});
const item3=new Item({name:"<-- Hit this to delete an item"});
const defaultItem=[item1,item2,item3];
const listSchema={
  name:String,
  items:[itemsSchema]
}
const List =new mongoose.model("List",listSchema);


app.get("/", function(req, res) {

  Item.find({},function(err,item){
    if(item.length===0){

      Item.insertMany(defaultItem,function(err){
        if(err){
          console.log(err);
        }else{
          console.log("default items inserted");
        }
      });
     res.redirect("/") ;
    }
    else{
     
      res.render("list", {listTitle: "Today", newListItems: item});
    }
  });

  

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName=req.body.list;
  const newItem=new Item({name:itemName});
  if(listName==="Today"){
    newItem.save();
    res.redirect("/");
  }else{
    List.findOne({name:listName},function(err,foundList){
      if(!err){
        foundList.items.push(newItem);
        foundList.save();
        res.redirect("/"+listName);
      }
    })
  }
 
});
app.post("/delete",function(req,res){
 const deleteItem=req.body.check;
 const delteItemValue=req.body.listName;
 if(delteItemValue==="Tody"){
 Item.findByIdAndRemove(deleteItem,function(err){
  if(err){
    console.log(err);
  }else{
    res.redirect("/");
  }
 });
}else{
  List.findOneAndUpdate({name:delteItemValue},{$pull:{items:{_id:deleteItem}}},function(err,foundList){
    if(!err){
      res.redirect('/'+delteItemValue);
    }
  })
}



});

app.get("/:customListName",function(req,res){
  const customListName= _.upperCase(req.params.customListName);
List.findOne({name:customListName},function(err,foundList){
  if(!err){
  if(!foundList){
    // create a new list if doesnot exist
    const list =new List({name:customListName,items:defaultItem});
    list.save();
    res.redirect("/"+customListName);
    
  }else{
    // show the existing list
    res.render("list",{listTitle: foundList.name, newListItems:foundList.items })
  }
}
})
})

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
