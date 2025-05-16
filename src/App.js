import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './layouts/Layouts';

import Home from './pages/Home';
import Alert from './pages/Alert';
import History from './pages/History';
import Manage from './pages/Manage';

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/alerts" element={<Alert />} />
          <Route path="/history" element={<History />} />
          <Route path="/manage" element={<Manage />} />
        </Routes>
      </Layout>
    </Router>
  );
}
