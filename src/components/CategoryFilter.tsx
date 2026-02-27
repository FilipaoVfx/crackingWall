import React from 'react';
import { motion } from 'framer-motion';
import { Category } from '../types';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string | null;
  onCategorySelect: (category: string | null) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onCategorySelect
}) => {
  return (
    <div className="bg-brutal-black border-4 border-brutal-black p-6 mb-8">
      <h2 className="text-2xl font-brutal font-black text-brutal-white mb-4 uppercase">
        CATEGORÍAS
      </h2>
      
      <div className="flex flex-wrap gap-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onCategorySelect(null)}
          className={`px-4 py-2 font-brutal font-black uppercase border-3 border-brutal-white transition-all ${
            selectedCategory === null
              ? 'bg-brutal-pink text-brutal-black'
              : 'bg-brutal-white text-brutal-black hover:bg-brutal-yellow'
          }`}
        >
          TODAS ({categories.reduce((acc, cat) => acc + cat.count, 0)})
        </motion.button>
        
        {categories.map((category) => (
          <motion.button
            key={category.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onCategorySelect(category.name)}
            className={`px-4 py-2 font-brutal font-black uppercase border-3 border-brutal-white transition-all ${
              selectedCategory === category.name
                ? 'bg-brutal-lime text-brutal-black'
                : 'bg-brutal-white text-brutal-black hover:bg-brutal-cyan'
            }`}
          >
            {category.name} ({category.count})
          </motion.button>
        ))}
      </div>
    </div>
  );
};
