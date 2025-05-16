// src/layout/Header.jsx
import React from 'react';
import Navbar from './Navbar.jsx';

export default function Header() {
  return (
    <header style={{ background: '#007bff', color: 'white', padding: '10px 20px' }}>
      <div style={{ fontWeight: 'bold', fontSize: '20px' }}>Smart Security System</div>
      <Navbar />
    </header>
  );
}
