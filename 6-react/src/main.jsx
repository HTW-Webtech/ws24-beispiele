import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Pokedex } from './Pokedex.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Pokedex />
  </StrictMode>,
);
