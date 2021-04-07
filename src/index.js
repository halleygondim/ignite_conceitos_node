const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];


function checkUser(userName) {

  const userCheck = users.find(us => us.username === userName)
  if (userCheck) {
    return true
  } else {
    return false
  }

}

//Middleware
function checksExistsUserAccount(request, response, next) {

  const { username } = request.headers;
  const user = users.find(u => u.username === username)

  if (!user) {
    return response.status(400).json({ error: "User not found!" })
  }

  request.user = user;
  return next();

}

app.post('/users', (request, response) => {

  const { name, username } = request.body

  if (!checkUser(username)) {

    users.push({
      id: uuidv4(),
      name,
      username,
      todos: []
    });

    return response.json(users).status(201)

  } else {

    return response.status(400).json({ error: "User already exists!" })
  }

});

app.get('/todos', checksExistsUserAccount, (request, response) => {

  const { user } = request
  return response.json(user.todos).status(200)


});

app.post('/todos', checksExistsUserAccount, (request, response) => {

  const { user } = request
  const { title, deadline } = request.body

  user.todos.push({
    id: uuidv4(),
    title: title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  })

  return response.json(user.todos).status(201)

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { title, deadline } = request.body
  const { id } = request.params

  let todo = user.todos.find(td => td.id === id)
  if (todo) {
    todo.title = title
    todo.deadline = deadline

    return response.json(user.todos).status(200)
  } else {

    return response.status(404).json({ error: "Todo not found!" })
  }

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params

  let todo = user.todos.find(td => td.id === id)
  if (todo) {
    todo.done = true
    return response.json(user.todos).status(200)
  } else {
    return response.status(404).json({ error: "Todo not found!" })
  }

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {

  const { user } = request
  const { id } = request.params

  const todoDelete = user.todos.findIndex(td => td.id === id)

  if (todoDelete) {
    user.todos.slice(todoDelete, 1)

  } else {
    return response.status(404).json({ error: "Todo not found!" })
  }


});

module.exports = app;