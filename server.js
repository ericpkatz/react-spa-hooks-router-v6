const { syncAndSeed, models: { User, Thing} } = require('./db');
const express = require('express');
const app = express();
const path = require('path');

app.use('/dist', express.static(path.join(__dirname, 'dist')));

app.get('/', (req, res)=> res.sendFile(path.join(__dirname, 'index.html')));

app.get('/api/users', async(req, res, next)=> {
  try {
    res.send(await User.findAll());
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


