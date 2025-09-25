
import React, { ReactNode } from 'https://aistudiocdn.com/react@^19.1.1';

interface InputGroupProps {
  label: string;
  icon?: string;
  children: ReactNode;
  className?: string;
}

const InputGroup: React.FC<InputGroupProps> = ({ label, icon, children, className = '' }) => {
  return (
    <div className={`relative ${className}`}>
      <label className="block text-sm font-semibold mb-1 text-gray-600 dark:text-gray-400">
        {icon && <i className={`${icon} mr-2`}></i>}
        {label}
      </label>
      {children}
    </div>
  );
};

export default InputGroup;