import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import Home from './pages/Home';
import PassportDashboard from './pages/PassportDashboard';
import DestinationDetail from './pages/DestinationDetail';
import Compare from './pages/Compare';
import VisaGuide from './pages/VisaGuide';

function App() {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/passport/:code" element={<PassportDashboard />} />
          <Route path="/country/:iso" element={<DestinationDetail />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/guide" element={<VisaGuide />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
}

export default App;
