var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/d3avoider');

var app = express();

app.use(express.static(__dirname));

// Mongoose

var Schema = mongoose.Schema;

var ScoreSchema = new Schema({
  username: String,
  score: Number
});

mongoose.model('Score', ScoreSchema);

var Score = mongoose.model('Score');

/*var blog = new Blog({
  author: 'Michael',
  title: 'Michael\'s Blog',
  url: 'http://michaelsblog.com'
});

blog.save();*/

app.use(bodyParser());

// ROUTES

app.get('/api/scores', function(req, res) {
  Score.find(function(err, scores) {
    scores.sort(function(a, b){
      return b.score - a.score;
    });
    scores = scores.slice(0, 10);
    scores.forEach(function(item) {
      console.log("Received a GET request for _id: " + item._id);
    })
    res.send(scores);
  });
});

app.post('/api/scores', function(req, res) {
  console.log('Received a POST request:')
  console.log(req.body);
  for (var key in req.body) {
    console.log(key + ': ' + req.body[key]);
  }
  var score = new Score(req.body);
  score.save(function(err, doc) {
    res.send(score);
  });
});

var port = process.env.PORT || 3000;

app.listen(port);
console.log(port);