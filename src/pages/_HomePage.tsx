import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

// Cyberpunk theme styles
const cyberpunkStyles = `
  :root {
    --dark-bg: #0a0a0f;
    --darker: #050509;
    --card-bg: #121218;
    --text-primary: #f0f0f0;
    --text-secondary: #a0a0a0;
    --accent: #6c63ff;
    --accent-hover: #7d75ff;
  }

  /* Global styles */
  body {
    background: var(--dark-bg);
    color: var(--text-primary);
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    overflow-x: hidden;
    line-height: 1.6;
  }

  /* Simplified container */
  .scanlines {
    position: relative;
    overflow: hidden;
  }

  @keyframes glow-pulse {
    0%, 100% { 
      text-shadow: 0 0 10px currentColor,
                   0 0 20px currentColor;
    }
    50% { 
      text-shadow: 0 0 20px currentColor,
                   0 0 40px currentColor,
                   0 0 60px currentColor;
    }
  }

  /* Hero Section */
  @keyframes neonBorder {
    0% {
      box-shadow: 0 0 5px #b026ff,
                  0 0 10px #b026ff,
                  0 0 20px #b026ff,
                  0 0 30px #8a2be2;
    }
    50% {
      box-shadow: 0 0 10px #b026ff,
                  0 0 20px #b026ff,
                  0 0 30px #8a2be2,
                  0 0 40px #8a2be2;
    }
    100% {
      box-shadow: 0 0 5px #b026ff,
                  0 0 10px #b026ff,
                  0 0 20px #b026ff,
                  0 0 30px #8a2be2;
    }
  }

  .hero {
    min-height: 70vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 80px 20px;
    background: linear-gradient(135deg, var(--darker) 0%, #1a1a2e 100%);
    position: relative;
    overflow: hidden;
    border: 2px solid transparent;
    animation: neonBorder 3s infinite;
    margin: 20px;
    border-radius: 10px;
  }

  .hero::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(45deg, #b026ff, #8a2be2, #9400d3);
    z-index: -1;
    border-radius: 12px;
    opacity: 0.7;
  }

  .hero-content {
    position: relative;
    z-index: 10;
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px;
    background: rgba(10, 10, 15, 0.8);
    border-radius: 8px;
    backdrop-filter: blur(5px);
    border: 1px solid rgba(138, 43, 226, 0.3);
  }

  .hero-title {
    font-size: clamp(2.2rem, 6vw, 4rem);
    font-weight: 800;
    background: linear-gradient(90deg, #b026ff, #8a2be2, #9400d3);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin: 0 0 1.5rem;
    line-height: 1.2;
    letter-spacing: -1px;
    position: relative;
    max-width: 800px;
    text-shadow: 0 0 10px rgba(176, 38, 255, 0.3);
    transition: text-shadow 0.3s ease;
  }
  
  .hero-title:hover {
    text-shadow: 0 0 20px rgba(176, 38, 255, 0.6);
  }

  .hero-title::after {
    content: '';
    display: block;
    width: 100px;
    height: 3px;
    background: linear-gradient(90deg, #b026ff, #8a2be2);
    margin: 1.5rem auto 0;
    border-radius: 3px;
    box-shadow: 0 0 15px rgba(176, 38, 255, 0.5);
  }

  .hero-subtitle {
    font-size: clamp(1rem, 2vw, 1.2rem);
    color: var(--text-secondary);
    margin: 0 auto 2.5rem;
    max-width: 600px;
    line-height: 1.6;
    font-weight: 400;
  }

  .cta-button {
    background: var(--accent);
    color: white;
    border: none;
    border-radius: 6px;
    padding: 12px 32px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    text-decoration: none;
    display: inline-block;
  }

  .cta-button:hover {
    background: var(--accent-hover);
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(108, 99, 255, 0.3);
  }

  /* Categories Section */
  .categories-section {
    max-width: 1400px;
    margin: 80px auto;
    padding: 0 20px;
  }

  .section-title {
    font-size: clamp(2rem, 5vw, 3rem);
    font-weight: 900;
    text-transform: uppercase;
    margin-bottom: 60px;
    text-align: center;
    color: #fff;
    text-shadow: 
      3px 3px 0 var(--neon-cyan),
      6px 6px 0 var(--neon-pink);
  }

  .categories-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 30px;
  }

  .category-card {
    background: var(--card-bg);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    padding: 30px 25px;
    cursor: pointer;
    transition: all 0.3s ease;
    text-decoration: none;
    color: inherit;
  }

  .category-card:hover {
    transform: translateY(-5px);
    border-color: var(--accent);
    box-shadow: 0 10px 30px rgba(108, 99, 255, 0.15);
  }

  .category-card:nth-child(1) { border-top: 3px solid #6c63ff; }
  .category-card:nth-child(2) { border-top: 3px solid #ff6b6b; }
  .category-card:nth-child(3) { border-top: 3px solid #4ecdc4; }
  .category-card:nth-child(4) { border-top: 3px solid #9c89b8; }

  .category-title {
    font-size: 1.8rem;
    font-weight: 900;
    text-transform: uppercase;
    margin-bottom: 15px;
    color: #fff;
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
  }

  .category-description {
    font-size: 1rem;
    font-weight: bold;
    color: rgba(255, 255, 255, 0.8);
    line-height: 1.5;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .hero {
      min-height: 60vh;
      padding: 40px 20px;
    }

    .categories-grid {
      grid-template-columns: 1fr;
      gap: 30px;
    }
  }
`;

import { Wallpaper } from '../types';

const HomePage: React.FC = () => {
  // Add global styles on component mount
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = cyberpunkStyles;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);
  return (
    <>
      {/* Hero Section */}


      {/* Featured Categories */}
      <section className="categories-section">
        <h2 className="section-title">Featured Categories</h2>

        <div className="categories-grid">
          {[
            {
              name: 'Cyberpunk',
              description: 'Sophisticated neon-lit metropolitan landscapes'
            },
            {
              name: 'Digital Systems',
              description: 'Elegant terminal interfaces and abstract visualizations'
            },
            {
              name: 'Minimalist',
              description: 'Clean and simple tech-inspired designs'
            },
            {
              name: 'Abstract',
              description: 'Creative and artistic tech patterns'
            }
          ].map((category) => (
            <Link
              key={category.name}
              to={`/wallpapers?category=${category.name.toLowerCase()}`}
              className="category-card"
            >
              <h3 className="category-title">{category.name}</h3>
              <p className="category-description">{category.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
};

export default HomePage;
