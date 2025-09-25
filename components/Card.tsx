
import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-[#e0e5ec] rounded-3xl p-7 shadow-[10px_10px_20px_#bebebe,_-10px_-10px_20px_#ffffff] transition-all duration-300 hover:shadow-[12px_12px_24px_#bebebe,_-12px_-12px_24px_#ffffff] dark:bg-gray-800 dark:shadow-[10px_10px_20px_#1c222b,_-10px_-10px_20px_#2c3645] dark:hover:shadow-[12px_12px_24px_#1c222b,_-12px_-12px_24px_#2c3645] ${className}`}>
      {children}
    </div>
  );
};

export default Card;
