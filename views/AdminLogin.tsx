import React, { useState } from 'react';
import Card from '../components/Card';
import InputGroup from '../components/InputGroup';

interface AdminLoginProps {
  onLogin: (email: string) => void;
  onBack: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, onBack }) => {
  const [email, setEmail] = useState('');
  const inputStyles = "w-full p-3 bg-[#e0e5ec] rounded-xl shadow-[inset_5px_5px_10px_#bebebe,_inset_-5px_-5px_10px_#ffffff] focus:shadow-[inset_3px_3px_7px_#bebebe,_inset_-3px_-3px_7px_#ffffff] outline-none transition-shadow duration-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 dark:shadow-[inset_5px_5px_10px_#1c222b,_inset_-5px_-5px_10px_#2c3645] dark:focus:shadow-[inset_3px_3px_7px_#1c222b,_inset_-3px_-3px_7px_#2c3645]";
  const buttonStyles = "w-full p-3.5 rounded-xl font-bold transition-all duration-200 transform active:scale-[0.98]";


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email);
  };

  return (
    <Card>
      <h1 className="text-3xl font-bold text-center mb-6 text-slate-700 dark:text-slate-200">
        <i className="fa-solid fa-user-shield mr-2"></i> Admin Login
      </h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <InputGroup label="Email Address" icon="fa-solid fa-envelope">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@example.com"
            required
            className={inputStyles}
          />
        </InputGroup>
        <button
          type="submit"
          className={`${buttonStyles} text-slate-600 dark:text-slate-200 shadow-[5px_5px_10px_#bebebe,_-5px_-5px_10px_#ffffff] active:shadow-[inset_5px_5px_10px_#bebebe,_inset_-5px_-5px_10px_#ffffff] dark:shadow-[5px_5px_10px_#1c222b,_-5px_-5px_10px_#2c3645] dark:active:shadow-[inset_5px_5px_10px_#1c222b,_inset_-5px_-5px_10px_#2c3645] flex items-center justify-center gap-2`}
        >
          <i className="fa-solid fa-right-to-bracket"></i> Login
        </button>
      </form>
      <button
        onClick={onBack}
        className={`${buttonStyles} mt-4 text-purple-600 dark:text-purple-400 shadow-[5px_5px_10px_#bebebe,_-5px_-5px_10px_#ffffff] active:shadow-[inset_5px_5px_10px_#bebebe,_inset_-5px_-5px_10px_#ffffff] dark:shadow-[5px_5px_10px_#1c222b,_-5px_-5px_10px_#2c3645] dark:active:shadow-[inset_5px_5px_10px_#1c222b,_inset_-5px_-5px_10px_#2c3645] flex items-center justify-center gap-2`}
      >
        <i className="fa-solid fa-arrow-left"></i> মেনুতে ফিরে যান
      </button>
    </Card>
  );
};

export default AdminLogin;