import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TaxCalculator from './TaxCalculator';
import BudgetNews from './BudgetNews';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TaxCalculator />} />
        <Route path="/budget-news" element={<BudgetNews />} />
      </Routes>
    </Router>
  );
}

export default App;