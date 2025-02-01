import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const BudgetNews = () => {
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const NEWS_API_KEY = import.meta.env.VITE_NEWS_API;
  const NEWS_API_URL = `https://newsapi.org/v2/everything?q=Indian%20Parliament%20budget%202025%20Nirmala%20Sitharaman&apiKey=${NEWS_API_KEY}&pageSize=20`;

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get(NEWS_API_URL);
        setNews(response.data.articles);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to fetch news.');
        setIsLoading(false);
      }
    };

    fetchNews();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto relative">
        <Link 
          to="/" 
          className="fixed top-4 right-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full transition-colors"
        >
          Back to Calculator
        </Link>
        
        <h2 className="text-2xl font-bold mb-6">Budget News 2025</h2>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-600">Loading news...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {news.slice(0, 5).map((article, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-4">
                <div className="flex gap-4">
                  {article.urlToImage && (
                    <img
                      src={article.urlToImage}
                      alt="News"
                      className="w-24 h-24 rounded-md object-cover flex-shrink-0"
                    />
                  )}
                  <div>
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lg font-medium text-blue-600 hover:underline block mb-2"
                    >
                      {article.title}
                    </a>
                    <p className="text-gray-600">{article.description}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      {new Date(article.publishedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetNews;