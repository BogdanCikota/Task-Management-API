//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const cors = require('cors');

mongoose.connect('mongodb+srv://admin-bogdan:test123@cluster0.kbao2.mongodb.net/todoappDB', { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });
// mongoose.connect('mongodb://localhost:27017/todolistDB2', { useNewUrlParser: true, useUnifiedTopology: true });

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(methodOverride(function (req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {

    let method = req.body._method
    delete req.body._method
    return method
  }
}));

app.use(cors());

const itemSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model('Item', itemSchema);

const item1 = new Item({
  name: 'Welcome to your todo list!'
});

// const item2 = new Item({
//   name: 'Hit the + button to add a new item.'
// });

// const item3 = new Item({
//   name: '<-- Hit this to delete an item.'
// });

const defaultItems = [item1];



//---------------------------------------------

const listCollectionSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema]
});

const List = mongoose.model('List', listCollectionSchema);

app.get('/', function (req, res) {
  res.redirect('lists');
});

app.route('/lists')
  .get(function (req, res) {
    List.find({}, function (err, foundLists) {
      if (err) {
        res.send(err);
      } else {
        if (foundLists.length === 0) {
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
        }

      }
    });
  })
  .post(function (req, res) {
    const newList = new List({
      name: req.body.name,
      items: []
    });

    newList.save(function (err) {
      if (err) {
        res.send(err);
      } else {
        List.find({}, function (error, foundLists) {
          if (error) {
            res.send(error);
          } else {
            res.send(foundLists);
          }
        });
      }
    });
  })
  .delete(function (req, res) {

    List.deleteMany({}, function (err) {
      if (err) {
        res.send(err);
      } else {
        const newList = new List({
          name: 'default list',
          items: defaultItems
        });
        newList.save(function (error) {
          if (error) {
            res.send(error);
          } else {
            List.find({}, function (er, foundLists) {
              if (er) {
                res.send(er);
              } else {
                res.send(foundLists);
              }
            });
          }
        });

      }
    });
  });

  app.route('/lists/:selectedList')
  .patch(function (req, res) {
    List.findOneAndUpdate({ name: req.params.selectedList }, { $set: { name: req.body.name } }, { useFindAndModify: false }, function (err) {
      if (err) {
        res.send(err);
      } else {
        List.find({}, function (error, foundLists) {
          if (error) {
            res.send(error);
          } else {
            res.send(foundLists);
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
        List.find({}, function (error, foundLists) {
          if (error) {
            res.send(error);
          } else {
            res.send(foundLists);
          }
        });
      }
    });
  });

app.route('/lists/:selectedList/items')
  .get(function (req, res) {
    const selectedList = req.params.selectedList;

    List.findOne({ name: selectedList }, function (err, foundList) {
      if (err) {
        res.send(err);
      } else {
        res.send(foundList);
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
            List.findOne({ name: req.params.selectedList }, function (er, foundList) {
              if (er) {
                res.send(er);
              } else {
                res.send(foundList);
              }
            });
          }
        });
      }
    });
  })
  .patch(function (req, res) {
    List.findOneAndUpdate({ name: req.params.selectedList }, { $set: { items: [] } }, { useFindAndModify: false }, function (err) {
      if (err) {
        res.send(err);
      } else {
        List.findOne({ name: req.params.selectedList }, function (error, foundList) {
          if (error) {
            res.send(error);
          } else {
            res.send(foundList);
          }
        });
      }
    });
  })

app.route('/lists/:selectedList/items/:selectedItem')
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
            List.find({name: req.params.selectedList}, function (er, foundList) {
              if (er) {
                res.send(er);
              } else {
                res.send(foundList);
              }
            });
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

        foundList.save(function (error) {
          if (error) {
            res.send(error);
          } else {
            List.findOne({name: req.params.selectedList}, function (er, foundList) {
              if (er) {
                res.send(er);
              } else {
                res.send(foundList);
              }
            });
          }
        });
      }

    });
  });


app.listen(process.env.PORT || 3000, function () {
  console.log("Server started on port 3000");
});
