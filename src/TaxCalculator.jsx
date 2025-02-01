import React, { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import './App.css';
import { Link } from 'react-router-dom';


const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const TaxCalculator = () => {
  const [income, setIncome] = useState('');
  const [aiAdvice, setAiAdvice] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const TAX_SLABS = {
    old: [
      { income: 800000, tax: 30000 },
      { income: 900000, tax: 40000 },
      { income: 1000000, tax: 50000 },
      { income: 1100000, tax: 65000 },
      { income: 1200000, tax: 80000 },
      { income: 1600000, tax: 170000 },
      { income: 2000000, tax: 290000 },
      { income: 2400000, tax: 410000 },
      { income: 5000000, tax: 1190000 }
    ],
    new: [
      { income: 800000, tax: 20000 },
      { income: 900000, tax: 30000 },
      { income: 1000000, tax: 40000 },
      { income: 1100000, tax: 50000 },
      { income: 1200000, tax: 60000 },
      { income: 1600000, tax: 120000 },
      { income: 2000000, tax: 200000 },
      { income: 2400000, tax: 300000 },
      { income: 5000000, tax: 1080000 }
    ]
  };

  const interpolateTax = (amount, slabs) => {
    if (amount <= 0) return 0;
    
    let lowerSlab = { income: 0, tax: 0 };
    let upperSlab = slabs[0];
    
    for (let slab of slabs) {
      if (amount > slab.income) {
        lowerSlab = slab;
      } else {
        upperSlab = slab;
        break;
      }
    }
    
    if (amount <= slabs[0].income) {
      return (amount / upperSlab.income) * upperSlab.tax;
    }
    
    if (amount >= slabs[slabs.length - 1].income) {
      const highestSlab = slabs[slabs.length - 1];
      const extraAmount = amount - highestSlab.income;
      return highestSlab.tax + (extraAmount * 0.30);
    }
    
    const ratio = (amount - lowerSlab.income) / (upperSlab.income - lowerSlab.income);
    return lowerSlab.tax + (ratio * (upperSlab.tax - lowerSlab.tax));
  };

  const calculateTax = (income, regime) => {
    const numIncome = Number(income);
    const tax = interpolateTax(numIncome, TAX_SLABS[regime]);
    
    if (regime === 'new' && numIncome <= 1200000) {
      return 0;
    }
    
    return Math.round(tax);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const generateAiExplanation = async (income, oldTax, newTax) => {
    setIsLoading(true);
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const prompt = `Explain tax savings for an annual income of INR ${income} in simple terms. 
      Old tax: INR ${oldTax}, New tax: INR ${newTax}. Difference: INR ${oldTax - newTax}.
      Provide a short 5-sentence detailed explanation with a financial advice tip. Use simple language.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      setAiAdvice(text);
    } catch (error) {
      console.error("AI Error:", error);
      setAiAdvice("Could not generate AI advice at this time.");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (income && calculateTax(income, 'old') !== calculateTax(income, 'new')) {
      const oldTax = calculateTax(income, 'old');
      const newTax = calculateTax(income, 'new');
      generateAiExplanation(income, oldTax, newTax);
    }
  }, [income]);

  return (
    <div className="relative max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <Link 
        to="/budget-news" 
        className="fixed top-4 right-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full transition-colors"
      >
        View Budget News
      </Link>
      <h1 className="text-xl font-bold mb-4">Indian Tax Calculator 2024</h1>
      
      <div className="mb-6">
        <label className="block text-sm mb-2">Enter Annual Income (in ₹)</label>
        <input
          type="number"
          value={income}
          onChange={(e) => setIncome(e.target.value)}
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
          placeholder="Enter your annual income"
        />
      </div>

      {income && (
        <>
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h2 className="font-semibold mb-2">Present Tax Regime</h2>
            <div className="space-y-1">
              <p className="text-sm">Gross Income: {formatCurrency(income)}</p>
              <p className="text-sm">Tax: {formatCurrency(calculateTax(income, 'old'))}</p>
              <p className="text-sm font-medium">
                In-hand Income: {formatCurrency(income - calculateTax(income, 'old'))}
              </p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h2 className="font-semibold mb-2">Proposed Tax Regime</h2>
            <div className="space-y-1">
              <p className="text-sm">Gross Income: {formatCurrency(income)}</p>
              <p className="text-sm">Tax: {formatCurrency(calculateTax(income, 'new'))}</p>
              <p className="text-sm font-medium">
                In-hand Income: {formatCurrency(income - calculateTax(income, 'new'))}
              </p>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <h2 className="font-semibold mb-2">Important Note</h2>
            <p className="text-sm text-gray-700">
              For incomes above ₹12,00,000, you will need to pay full tax as per the applicable slab rate. The rebate benefit is only available for incomes up to ₹12,00,000.
            </p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg mb-4">
            <h2 className="font-semibold mb-2">
              <i className="ri-money-rupee-circle-line"></i> Your Benefit Under New Regime
            </h2>
            <p className="text-lg font-medium">
              {formatCurrency(
                (income - calculateTax(income, 'new')) - 
                (income - calculateTax(income, 'old'))
              )}
            </p>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg mt-4">
            <h2 className="font-semibold mb-2">
              <i className="ri-brain-line"></i> AI-Powered Tax Insights
            </h2>
            {isLoading ? (
              <p className="text-sm text-gray-700">Analyzing your tax savings...</p>
            ) : (
              <p className="text-sm whitespace-pre-wrap">{aiAdvice}</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default TaxCalculator;
