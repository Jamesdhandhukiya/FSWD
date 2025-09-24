import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Website from './website';
import Home from './home';
import AboutUs from './aboutUs';
import Contact from './contact';
import './website.css';

function App() {
  return (
    <Router>
      <Website />
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </Router>
  );
}

export default App;