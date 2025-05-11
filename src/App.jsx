// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import NFTDetail from './pages/NFTDetail';
import './App.css';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/nft/:id" element={<NFTDetail />} />
      </Routes>
    </div>
  );
}

export default App;