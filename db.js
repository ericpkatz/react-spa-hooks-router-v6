const Sequelize = require('sequelize');
const { DataTypes: { STRING, TEXT }} = Sequelize;
const conn = new Sequelize(process.env.DATABASE_URL || 'postgres://localhost/acme_db');

const User = conn.define('user', {
  name: {
    type: STRING
  },
  bio: {
    type: TEXT
  }
});

const Thing = conn.define('thing', {
  name: {
    type: STRING
  }
});


const syncAndSeed = async()=> {
  await conn.sync({ force: true });
  const [moe, larry, lucy, foo, bar, bazz] = await Promise.all([
    User.create({ name: 'moe', bio: 'moes bio'}),
    User.create({ name: 'larry', bio: 'larry\'s b bio'}),
    User.create({ name: 'lucy', bio: 'lucy\'s b bio'}),
    Thing.create({ name: 'foo' }),
    Thing.create({ name: 'bar' }),
    Thing.create({ name: 'bazz' }),
  ]);
  
};

module.exports = {
  models: {
    User,
    Thing
  },
  syncAndSeed
};
