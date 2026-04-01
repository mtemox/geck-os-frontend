// src/features/widgets/NewsApp.jsx
import React, { useState, useEffect } from 'react';
import { Newspaper, Loader, AlertCircle, ExternalLink } from 'lucide-react';

const API_KEY = import.meta.env.VITE_NEWS_API_KEY;

function NewsApp() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      const url = `https://newsapi.org/v2/top-headlines?category=technology&language=en&pageSize=5&apiKey=${API_KEY}`;
      try {
        setLoading(true);
        const response = await fetch(url);
        if (!response.ok) throw new Error('No se pudieron cargar las noticias');
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

  // ── Estados de carga / error ──────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground gap-2">
        <Loader size={18} className="animate-spin text-brand-500" />
        <span className="text-sm">Cargando noticias...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full gap-2 text-destructive">
        <AlertCircle size={18} />
        <span className="text-sm">{error}</span>
      </div>
    );
  }

  // ── Vista principal ───────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-card text-foreground overflow-hidden">

      {/* Cabecera */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted shrink-0">
        <Newspaper size={16} className="text-brand-500" />
        <h2 className="text-sm font-semibold text-foreground">Tecnología</h2>
        <span className="ml-auto text-xs text-muted-foreground">{articles.length} artículos</span>
      </div>

      {/* Lista */}
      <ul className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-border">
        {articles.map((article) => (
          <li key={article.url} className="group px-4 py-3 hover:bg-muted transition-colors">
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start justify-between gap-3"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground group-hover:text-brand-500 transition-colors leading-snug line-clamp-2">
                  {article.title}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{article.source.name}</p>
              </div>
              <ExternalLink
                size={14}
                className="shrink-0 mt-0.5 text-muted-foreground/40 group-hover:text-brand-500 transition-colors"
              />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default NewsApp;