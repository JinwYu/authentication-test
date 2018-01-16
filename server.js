const express = require('express');
const app = express();
const path = require('path');
var mongojs = require('mongojs');
var db = mongojs('user:test@localhost:33423/gamedb', ['gamecollection']); //url, collection
var bodyParser = require('body-parser');

app.use('/', express.static(__dirname +  '/'));

app.get('/*', function(req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
});

const hostname = '0.0.0.0';
const port = 3000;








// Our server can now parse the data from the body.
app.use(bodyParser.json());

app.get('/gamelist', function (req, res){
    console.log("The server has received a get request.");

    db.gamecollection.find(function(error, gameobject){
        res.json(gameobject);
        console.log("Returned the data to the controller.")
    });
});

// Insert data to the database.
app.post('/gamelist', function(req, res){
    console.log(req.body);
    var newGame = req.body;
    // Insert the data to the database.
    db.gamecollection.insert(newGame, function(err, dbObject){
        console.log("The new item has successfully been inserted to the database.");
        // Send the data back to the controller.
        res.json(dbObject);
    });

});

// Delete an object from the database.
app.delete('/gamelist/:id', function(req, res){
    var id = req.params.id;
    //console.log(id);

    // Remove the object from the database.
    db.gamecollection.remove({_id: mongojs.ObjectId(id)}, function (err, doc){
        console.log("The item has been deleted from the server.");
        // Send the removed object back to the controller.
        res.json(doc);
    });
});

// Edit/update an existing object in the database.
app.put('/gamelist/:id', function(req, res) {
    var id = req.params.id;
    //console.log(req.params.id);

    db.gamecollection.findAndModify({
        query: {_id: mongojs.ObjectId(id)},
        update: {$set: {title: req.body.title, platform: req.body.platform, 
                        genre: req.body.genre, price: req.body.price,
                        comment: req.body.comment}},
        new: true}, function (err, doc) {
            //console.log(doc);
            console.log("The item has been modified in the database.")
            res.json(doc);
        }
    );
});










const server = app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);  
});




// BACKUPS
/*



app.use('/', express.static(__dirname +  '/'));

app.get('/*', function(req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
});

const hostname = '0.0.0.0';
const port = 3000;

const server = app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);  
});




*/