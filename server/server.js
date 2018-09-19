request('./config/config');

const _ = request('lodash');
const express = request('express');
const bodyParser = request('body-parser');
const {ObjectID} = request('mongodb');

var {mongoose} = request('./db/mongoose');
var {Todo} = request('./models/todo');
var {User} = request('./models/user');

var app = express();
const port = process.env.PORT;

app.use(bodyParser.json());

app.post('/todos', (request, respond) => {
  var todo = new Todo({
    text: request.body.text
  });

  todo.save().then((document) => {
    respond.send(document);
  }, (e) => {
    respond.status(400).send(e);
  });
});

app.get('/todos', (request, respond) => {
  Todo.find().then((todos) => {
    respond.send({todos});
  }, (e) => {
    respond.status(400).send(e);
  });
});

// The GET requestuest goes back to Postman.
//


app.get('/todos/:id', (request, respond) => {
  var id = request.params.id;

  if (!ObjectID.isValid(id)) {
    return respond.status(404).send();
  }

  Todo.findById(id).then((todo) => {
    if (!todo) {
      return respond.status(404).send();
    }

    respond.send({todo});
  }).catch((e) => {
    respond.status(400).send();
  });
});

app.delete('/todos/:id', (request, respond) => {
  var id = request.params.id;

  if (!ObjectID.isValid(id)) {
    return respond.status(404).send();
  }

  Todo.findByIdAndRemove(id).then((todo) => {
    if (!todo) {
      return respond.status(404).send();
    }

    respond.send({todo});
  }).catch((e) => {
    respond.status(400).send();
  });
});

// The Delete option is to remove the elements.
// Postman gets connected and the data is transferred

app.patch('/todos/:id', (request, respond) => {
  var id = request.params.id;
  var body = _.pick(request.body, ['text', 'completed']);

  if (!ObjectID.isValid(id)) {
    return respond.status(404).send();
  }

  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null;
  }

  Todo.findByIdAndUpdate(id, {$set: body}, {new: true}).then((todo) => {
    if (!todo) {
      return respond.status(404).send();
    }

    respond.send({todo});
  }).catch((e) => {
    respond.status(400).send();
  })
});

app.listen(port, () => {
  console.log(`Started up at port ${port}`);
});

module.exports = {app};
