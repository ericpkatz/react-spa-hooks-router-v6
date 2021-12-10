const { syncAndSeed, models: { User, Thing} } = require('./db');
const express = require('express');
const app = express();
const path = require('path');
const jwt = require('jsonwebtoken');

app.use('/dist', express.static(path.join(__dirname, 'dist')));
app.use(express.json());

app.get('/', (req, res)=> res.sendFile(path.join(__dirname, 'index.html')));

app.get('/api/login', async(req, res, next)=> {
  try {
    const { id } = jwt.verify(req.headers.authorization, process.env.JWT);
    res.send(await User.findByPk(id));
  }
  catch(ex){
    next(ex);
  }
});

app.post('/api/login', async(req, res, next)=> {
  try {
    const { name } = req.body;
    const user = await User.findOne({ where: { name }});
    if(!user){
      const err = Error('bad credentials');
      err.status = 401;
      throw err;
    }
    const token = jwt.sign({ id: user.id }, process.env.JWT);
    res.send({ token });
  }
  catch(ex){
    next(ex);
  }
});

app.get('/api/users', async(req, res, next)=> {
  try {
    res.send(await User.findAll());
  }
  catch(ex){
    next(ex);
  }
});

app.put('/api/users/:id', async(req, res, next)=> {
  try {
    const user = await User.findByPk(req.params.id);
    await user.update(req.body);
    res.send(user);
  }
  catch(ex){
    next(ex);
  }
});

app.post('/api/users', async(req, res, next)=> {
  try {
    const user = await User.create(req.body); 
    res.send(user);
  }
  catch(ex){
    next(ex);
  }
});

app.delete('/api/users/:id', async(req, res, next)=> {
  try {
    const user = await User.findByPk(req.params.id);
    await user.destroy();
    res.sendStatus(204);
  }
  catch(ex){
    next(ex);
  }
});

app.get('/api/things', async(req, res, next)=> {
  try {
    res.send(await Thing.findAll());
  }
  catch(ex){
    next(ex);
  }
});

app.use((err, req, res, next)=> {
  console.log(err);
  res.status(err.status || 500).send({ error: err.message });
});

const init = async()=> {
  try {
    const port = process.env.PORT || 3000;
    await syncAndSeed();

    app.listen(port, ()=> console.log(`listening on port ${port}`));
  }
  catch(ex){
    console.log(ex);
  }
}

init();


