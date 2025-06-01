import React from 'react';
import Footer from './Footer';
import Navbar from './Navbar';
import { Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flex: 1, padding: '20px', background: '#e9ecef' }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
