//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
// const _ = require('lodash');
const methodOverride = require('method-override');

mongoose.connect('mongodb://localhost:27017/todolistDB2', { useNewUrlParser: true, useUnifiedTopology: true });

const app = express();


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(methodOverride(function (req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    
    let method = req.body._method
    delete req.body._method
    return method
  }
}))

const itemSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model('Item', itemSchema);

const item1 = new Item({
  name: 'Welcome to your todolst!'
});

const item2 = new Item({
  name: 'Hit the + button to add a new item.'
});

const item3 = new Item({
  name: '<-- Hit this to delete an item.'
});

const defaultItems = [item1, item2, item3];



//---------------------------------------------

const listCollectionSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema]
});

const List = mongoose.model('List', listCollectionSchema);

app.get('/', function(req, res){
  res.redirect('lists');
});

app.route('/lists')
  .get(function (req, res) {
    List.find({}, function (err, foundLists) {
      if (err) {
        res.send(err);
      } else {
        if(foundLists.length === 0) {
          const newList = new List({
            name: 'default list',
            items: defaultItems
          });
      
          newList.save(function (err) {
            if (err) {
              res.send(err);
            } else {
              res.send(foundLists);
            }
          });
        } else {
          res.send(foundLists);
          // const lists = foundLists;
          // res.render('lists',{lists});
        }
        
      }
    });
  })
  .post(function (req, res) {
    const newList = new List({
      name: req.body.name,
      items: defaultItems
    });

    newList.save(function (err) {
      if (err) {
        res.send(err);
      } else {
        // res.send('Successfuly added new list.');
        res.redirect('/');
      }
    });
  })
  .delete(function (req, res) {

    List.deleteMany({}, function (err) {
      if (err) {
        res.send(err);
      } else {
        // res.send('Successfuly deleted all lists');
        res.redirect('/');
      }
    });
  });

app.route('/lists/:selectedList')
  .get(function (req, res) {
    const selectedList = req.params.selectedList;

    List.findOne({ name: selectedList }, function (err, foundList) {
      if (err) {
        res.send(err);
      } else {
        res.send(foundList);
        // const list = foundList;
        // res.render('list',{list,selectedList});
      }
    });
  })
  .patch(function (req, res) {
    List.findOneAndUpdate({ name: req.params.selectedList }, { $set: { name: req.body.name } }, { useFindAndModify: false }, function (err) {
      if (err) {
        res.send(err);
      } else {
        List.find({}, function (err, foundLists) {
          if (err) {
            res.send(err);
          } else {
            res.send(foundLists);
          }
        });
      }
    });
  })
  .post(function (req, res) {

    const newItem = new Item({
      name: req.body.name
    });

    List.findOne({ name: req.params.selectedList }, function (err, list) {
      if (err) {
        res.send(err);
      } else {
        list.items.push(newItem);
        list.save(function (error) {
          if (error) {
            res.send(error);
          } else {
            // res.send(list.items);
            // res.send(list.items[list.items.length - 1]);
            // foundList
            if(list.name === 'default list'){
              res.redirect('/');
            } else {
              res.redirect(list.name);
            }
            
          }
        });
      }


    });
  })
  .delete(function (req, res) {
    List.findOneAndDelete({ name: req.params.selectedList }, { useFindAndModify: false }, function (err) {
      if (err) {
        res.send(err);
      } else {
        res.redirect('/');
      }
    });
  });

app.route('/lists/:selectedList/:selectedItem')
  .patch(function (req, res) {

    List.findOne({ name: req.params.selectedList }, function (err, foundList) {
      if (err) {
        res.send(err);
      } else {

        let newItem = foundList.items.filter(item => item.name === req.params.selectedItem)[0];

        newItem.name = req.body.name;

        foundList.save(function (error) {
          if (error) {
            res.send(error);
          } else {
            res.redirect('/lists/' + foundList.name);
          }
        });
      }

    });

  })
  .delete(function (req, res) {
    List.findOne({ name: req.params.selectedList }, function (err, foundList) {
      if (err) {
        res.send(err);
      } else {

        const index = foundList.items.findIndex(item => item.name === req.params.selectedItem);

        foundList.items.splice(index, 1);

          foundList.save(function(error){
              if(error){
                res.send(error);
              } else {
                // res.send(foundList);
                if(foundList.name === 'default list') {
                  res.redirect('/');
                } else {
                  res.redirect('/lists/'+foundList.name);
                }
                
              }
            });
      }

    });
  });


app.listen(process.env.PORT || 3000, function () {
  console.log("Server started on port 3000");
});
