import React, { ReactNode } from 'react';
import { Seo } from '../seo/Seo';
import { HelmetProvider } from 'react-helmet-async';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  image?: string;
  keywords?: string[];
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  title,
  description,
  image,
  keywords
}) => {
  return (
    <HelmetProvider>
      <Seo 
        title={title}
        description={description}
        image={image}
        keywords={keywords}
      />
      <div className="min-h-screen bg-brutal-white text-brutal-black">
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </div>
    </HelmetProvider>
  );
};

export default Layout;
