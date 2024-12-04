import React, { useState } from 'react';
import Login from './components/Login';
import ProductList from './components/ProductList';

const App = () => {
  const [loggedIn, setLoggedIn] = useState(false);

  return (
    <div>
      {loggedIn ? <ProductList /> : <Login setLoggedIn={setLoggedIn} />}
    </div>
  );
};

export default App;
