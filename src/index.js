const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());

//INFORMAR AO NODE QUE IREMOS TRABALHAR COM JSON
app.use(express.json());

//NOSSO VETOR QUE IRÁ ARMAZERNAR OS USUÁRIOS
const users = [];

 

//MIDDLEWARE
function checksExistsUserAccount(request, response, next) {

  const { username } = request.headers;
  const user = users.find(u => u.username === username)

  if (!user) {
    return response.status(404).json({ error: 'User not found!' })
  }

  request.user = user;
  return next();

}

app.post('/users', (request, response) => {

  const { name, username } = request.body

  const userCheck = users.some(us => us.username === username)

  if (userCheck) {
    return response.status(400).json({ error: 'Username already exists' })
  }  

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  };

  users.push(user);


  return response.status(201).json(user);

});

app.get('/todos', checksExistsUserAccount, (request, response) => {

  const { user } = request
  return response.json(user.todos)

});

app.post('/todos', checksExistsUserAccount, (request, response) => {

  const { user } = request
  const { title, deadline } = request.body

 const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  };

  user.todos.push(todo)

  return response.status(201).json(todo);

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { title, deadline } = request.body
  const { id } = request.params

  const todo = user.todos.find(td => td.id === id)
  if (todo) {
    todo.title = title
    todo.deadline = new Date(deadline)

    return response.json(todo)
  } else {

    return response.status(404).json({ error:  'Todo not found!' })
  }

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params

  const todo = user.todos.find(td => td.id === id)
  if (!todo) {
    return response.status(404).json({ error:  'Todo not found' })
  } 

  todo.done = true
  return response.json(todo)

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {

  const { user } = request
  const { id } = request.params

  const todoDelete = user.todos.findIndex(td => td.id === id)

  if (todoDelete === -1) {
    return response.status(404).json({ error: 'Todo not found!' })

  } else {
    user.todos.splice(todoDelete, 1)
    return response.status(204).json();
  }


});

module.exports = app;