import React from 'react';
import { Link, Outlet } from 'react-router-dom'; // Link para navegação e Outlet para renderizar componentes

const App = () => {
  return (
    <div>
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/about">About</Link>
          </li>
        </ul>
      </nav>
      <hr />
      <Outlet /> {/* Aqui os componentes das rotas serão renderizados */}
    </div>
  );
};

export default App;
