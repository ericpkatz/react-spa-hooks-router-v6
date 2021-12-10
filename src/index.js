import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { render } from 'react-dom';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { combineReducers, createStore, applyMiddleware } from 'redux';
import { useNavigate, NavLink, Outlet, Link, HashRouter, Routes, Route, useParams } from 'react-router-dom';
import thunk from 'redux-thunk';

const updateUser = (user)=> {
  return async(dispatch)=> {
    const response = await axios.put(`/api/users/${user.id}`, user);
    dispatch({ type: 'UPDATE_USER', user: response.data });
  };
};

const login = ({ name }, navigate)=> {
  return async(dispatch)=> {
    const response = await axios.post('/api/login', { name });
    const { data: { token }} = response; 
    window.localStorage.setItem('token', token);
    dispatch(attemptTokenExchange());
    navigate('/');
  };
};

const logout = (navigate)=> {
  return (dispatch)=> {
    window.localStorage.removeItem('token');
    dispatch({ type: 'SET_AUTH', auth: {} });
    navigate('/login');
  };
};

const attemptTokenExchange = ()=> {
  return async(dispatch)=> {
    const token = window.localStorage.getItem('token');
    if(token){
      const response = await axios.get('/api/login', { 
        headers: {
          authorization: token
        }
      });
      const { data } = response; 
      dispatch({ type: 'SET_AUTH', auth: data });
    }
  };
};

const deleteUser = (user, navigate)=> {
  return async(dispatch)=> {
    const response = await axios.delete(`/api/users/${user.id}`);
    dispatch({ type: 'DELETE_USER', user });
    navigate('/users');
  };
};

const createUser = (user, navigate)=> {
  return async(dispatch)=> {
    const response = await axios.post('/api/users', user);
    dispatch({ type: 'CREATE_USER', user: response.data });
    navigate(`/users/${response.data.id}`);
  };
};

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

const auth = (state = {}, action)=> {
  if(action.type === 'SET_AUTH'){
    return action.auth;
  }
  return state;
}

const users = (state = [], action)=> {
  if(action.type === 'SET_USERS'){
    return action.users;
  }
  if(action.type === 'UPDATE_USER'){
    return state.map(user => user.id !== action.user.id ? user : action.user);
  }
  if(action.type === 'DELETE_USER'){
    return state.filter(user => user.id !== action.user.id); 
  }
  if(action.type === 'CREATE_USER'){
    return [...state, action.user]; 
  }
  return state;
};

const store = createStore(combineReducers({
  things,
  users,
  auth
}), applyMiddleware(thunk)); 

const Main = ()=> {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const auth = useSelector(state => state.auth);
  const things = useSelector(state => state.things);
  const users = useSelector(state => state.users);
  return (
    <div>
      <nav>
        <NavLink className={({isActive})=> isActive ? 'selected': '' } to='/'>Home</NavLink>
        <NavLink className={({isActive})=> isActive ? 'selected': '' }  to='/users'>Users ({ users.length})</NavLink>
        <NavLink className={({isActive})=> isActive ? 'selected': '' }  to='/things'>Things ({ things.length})</NavLink>
        {
        !auth.id  && <NavLink className={({isActive})=> isActive ? 'selected': '' }  to='/login'>Login</NavLink>
        }
        {
        !!auth.id  && <button onClick={ ()=> dispatch(logout(navigate)) }>Logout</button>
        }
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
};


const Users = ()=> {
  const users = useSelector(state => state.users);
  const [name, setName ] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const submit = (ev)=> {
    ev.preventDefault();
    dispatch(createUser({ name }, navigate));
    setName('');
  };
  return (
    <div>
      <h2>Users</h2>
      <form>
        <input value={ name } onChange={ ev => setName(ev.target.value)} /> 
        <button onClick={ ev => submit(ev)}>Create</button>
      </form>
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
  const user = useSelector(state => state.users.find( user => user.id === id*1)) || {};
  const [ name, setName ] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  useEffect(()=> {
    if(user.id){
      setName(user.name);
    }
  }, [ user ]);
  const submit = (ev) => {
    ev.preventDefault();
    dispatch(updateUser({ name, id}));
  }
  return (
    <div>
      <h2>User</h2>
    <form>
      <input value={ name } onChange={ev => setName(ev.target.value)} />
      <button onClick={ (ev)=> submit(ev) } disabled={ user.name === name }>Update</button>
    </form>
    <button onClick={()=> dispatch(deleteUser(user, navigate))}>Delete</button>
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
const Login = ()=> {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const submit = async(ev)=> {
    try {
      ev.preventDefault();
      await dispatch(login({ name }, navigate));
    }
    catch(ex){
      setError(ex.response.data.error);
    }

  };
  return (
    <form>
      { !!error && <div className='error'>{ error }</div> }
      <input value={ name } onChange={ ev => setName(ev.target.value)} /> 
      <button onClick={ submit }>Login</button>
    </form>
  );
}; 

const AppRoutes = ()=> {
  const dispatch = useDispatch();
  const auth = useSelector(state => state.auth);

  useEffect(()=> {
    try {
      dispatch(attemptTokenExchange());
    }
    catch(ex){
      console.log(ex);
    }
  }, []);
  useEffect(()=> {
    dispatch(fetchThings());
    dispatch(fetchUsers());
  }, []);
  return (
    <Routes>
      <Route path='/' element={ <Main />} >
        <Route path='users' element={ <Users /> }>
          <Route path=':id' element={<User />} />
        </Route>
        <Route path='things' element={ <Things /> }>
          <Route path=':id' element={ <Thing /> } />
        </Route>
        { !auth.id && <Route path='login' element={ <Login /> } /> }
        <Route path='' element={ <Home /> } />
      </Route>
    </Routes>
  );
};

const App = ()=> {
  return (
    <Provider store={ store }>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </Provider>
  );
};

render(<App />, document.querySelector('#root'));
