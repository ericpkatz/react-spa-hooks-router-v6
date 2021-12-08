import axios from 'axios';
import React, { useEffect } from 'react';
import { render } from 'react-dom';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { combineReducers, createStore, applyMiddleware } from 'redux';
import { NavLink, Outlet, Link, HashRouter, Routes, Route, useParams } from 'react-router-dom';
import thunk from 'redux-thunk';

const fetchThings = ()=> {
  return async(dispatch)=> {
    const response = await axios.get('/api/things');
    dispatch({ type: 'SET_THINGS', things: response.data });
  };
};

const fetchUsers = ()=> {
  return async(dispatch)=> {
    const response = await axios.get('/api/users');
    dispatch({ type: 'SET_USERS', users: response.data });
  };
};

const things = (state = [], action)=> {
  if(action.type === 'SET_THINGS'){
    return action.things;
  }
  return state;
};

const users = (state = [], action)=> {
  if(action.type === 'SET_USERS'){
    return action.users;
  }
  return state;
};

const store = createStore(combineReducers({
  things,
  users
}), applyMiddleware(thunk)); 

const Main = ()=> {
  const dispatch = useDispatch();
  useEffect(()=> {
    dispatch(fetchThings());
    dispatch(fetchUsers());
  }, []);
  const things = useSelector(state => state.things);
  const users = useSelector(state => state.users);
  return (
    <div>
      <nav>
        <NavLink className={({isActive})=> isActive ? 'selected': '' } to='/'>Home</NavLink>
        <NavLink className={({isActive})=> isActive ? 'selected': '' }  to='/users'>Users ({ users.length})</NavLink>
        <NavLink className={({isActive})=> isActive ? 'selected': '' }  to='/things'>Things ({ things.length})</NavLink>
      </nav>
      <Outlet />
    </div>
  );
};


const Users = ()=> {
  const users = useSelector(state => state.users);
  return (
    <div>
      <h2>Users</h2>
      <ul>
        {
          users.map( user => {
            return (
              <li key={ user.id }>
                <NavLink className={({isActive})=> isActive ? 'selected': ''  } to={`/users/${user.id}`}>{ user.name }</NavLink>
              </li>
            );
          })
        }
      </ul>
      <Outlet />
    </div>
  );
};

const User = ()=> {
  const { id } = useParams();
  const user = useSelector(state => state.users.find( user => user.id === id*1));
  return (
    <div>
      <h2>User</h2>
    <pre>
{
  JSON.stringify(user || {}, null, 2)
}
    </pre>
    </div>
  );
}

const Thing = ()=> {
  const params = useParams();
  const thing = useSelector(state => state.things.find(thing => thing.id === params.id*1))
  
  return (
    <div>
      <h2>Thing</h2>
      <pre>
{
  JSON.stringify(thing || {}, null, 2)
}
      </pre>
    </div>
  );
};

const Things = ()=> {
  const things = useSelector( state => state.things );
  return (
    <div>
      <h2>Things</h2>
      <ul>
        {
          things.map( thing => {
            return <li key={ thing.id }>
              <NavLink className={({ isActive })=> isActive ? 'selected': '' } to={`/things/${thing.id}`}>{ thing.name }</NavLink>
            </li>
          })
        }
      </ul>
      <Outlet />
    </div>
  );
}
const Home = ()=> <div>Home</div>;

const App = ()=> {
  return (
    <Provider store={ store }>
      <HashRouter>
        <Routes>
          <Route path='/' element={ <Main />} >
            <Route path='users' element={ <Users /> }>
              <Route path=':id' element={<User />} />
            </Route>
            <Route path='things' element={ <Things /> }>
              <Route path=':id' element={ <Thing /> } />
            </Route>
            <Route path='' element={ <Home /> } />
          </Route>
        </Routes>
      </HashRouter>
    </Provider>
  );
};

render(<App />, document.querySelector('#root'));
