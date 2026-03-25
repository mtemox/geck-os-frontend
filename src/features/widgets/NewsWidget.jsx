import React, { useState, useEffect } from 'react';

const API_KEY = import.meta.env.VITE_NEWS_API_KEY;

function NewsWidget() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      // Buscamos 5 noticias de tecnología en inglés (es la fuente más robusta)
      // Nota: En la cuenta gratis de NewsAPI, esto solo funciona en 'localhost'.
      const url = `https://newsapi.org/v2/top-headlines?category=technology&language=en&pageSize=5&apiKey=${API_KEY}`;
      
      try {
        setLoading(true);
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('No se pudieron cargar las noticias');
        }
        const data = await response.json();
        setArticles(data.articles);
        setError(null);
      } catch (err) {
        setError(err.message);
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (loading) {
    return <div className="text-white p-2">Cargando noticias...</div>;
  }

  if (error) {
    return <div className="text-red-400 p-2">Error: {error}</div>;
  }

  return (
    <div className="text-white h-full overflow-y-auto">
      <ul className="space-y-3">
        {articles.map((article) => (
          <li key={article.url} className="border-b border-purple-500/30 pb-3">
            <a 
              href={article.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="font-semibold hover:text-purple-300 transition-colors"
            >
              {article.title}
            </a>
            <p className="text-xs text-gray-400 mt-1">{article.source.name}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default NewsWidget;