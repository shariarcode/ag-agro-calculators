
import React from 'react';
import Card from '../components/Card';
import { View } from '../types';

interface MainMenuProps {
  onNavigate: (view: View) => void;
  isAdmin: boolean;
  onLogout: () => void;
}

const MainMenuButton: React.FC<{ onClick: () => void, icon: string, text: string, className?: string, textColor?: string, style?: React.CSSProperties }> = ({ onClick, icon, text, className = 'shadow-[5px_5px_10px_#bebebe,_-5px_-5px_10px_#ffffff] active:shadow-[inset_5px_5px_10px_#bebebe,_inset_-5px_-5px_10px_#ffffff] dark:shadow-[5px_5px_10px_#1c222b,_-5px_-5px_10px_#2c3645] dark:active:shadow-[inset_5px_5px_10px_#1c222b,_inset_-5px_-5px_10px_#2c3645]', textColor = 'text-blue-600 dark:text-blue-400', style }) => (
    <button
        onClick={onClick}
        style={style}
        className={`w-full py-4 px-6 text-lg font-bold rounded-2xl transition-all duration-200 transform hover:-translate-y-1 flex items-center justify-center gap-3 active:scale-[0.98] ${className} ${textColor}`}
    >
        <i className={icon}></i> {text}
    </button>
);

const MainMenu: React.FC<MainMenuProps> = ({ onNavigate, isAdmin, onLogout }) => {
  return (
    <Card>
        <h1 className="text-4xl font-bold text-center mb-8 text-slate-700 dark:text-slate-200 flex items-center justify-center gap-3">
            📊 AG Agro Calculators
        </h1>
        <div className="flex flex-col gap-5 stagger-animation">
            <MainMenuButton 
                style={{'--stagger-index': 0} as React.CSSProperties} 
                onClick={() => onNavigate('ai-assistant')} 
                icon="fa-solid fa-brain" 
                text="AI কৃষি বিশেষজ্ঞ" 
                className="shadow-[5px_5px_10px_#bebebe,_-5px_-5px_10px_#ffffff] active:shadow-[inset_5px_5px_10px_#bebebe,_inset_-5px_-5px_10px_#ffffff] dark:shadow-[5px_5px_10px_#1c222b,_-5px_-5px_10px_#2c3645] dark:active:shadow-[inset_5px_5px_10px_#1c222b,_inset_-5px_-5px_10px_#2c3645] bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50" 
                textColor="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400"
            />
            <MainMenuButton style={{'--stagger-index': 1} as React.CSSProperties} onClick={() => onNavigate('feed-calculator')} icon="fa-solid fa-calculator" text="ফিড কার্ট ক্যাল্কুলেটর" />
            <MainMenuButton style={{'--stagger-index': 2} as React.CSSProperties} onClick={() => onNavigate('broiler-calculator')} icon="fa-solid fa-calculator" text="ব্রয়লার FCR ক্যাল্কুলেটর" />
            <MainMenuButton style={{'--stagger-index': 3} as React.CSSProperties} onClick={() => onNavigate('profit-calculator')} icon="fa-solid fa-chart-line" text="লাভ/ক্ষতি ক্যাল্কুলেটর" />
            <MainMenuButton style={{'--stagger-index': 4} as React.CSSProperties} onClick={() => onNavigate('company-info')} icon="fa-solid fa-building" text="কোম্পানির পরিচিতি" />
            <MainMenuButton style={{'--stagger-index': 5} as React.CSSProperties} onClick={() => onNavigate('farm-info')} icon="fa-solid fa-seedling" text="খামারের তথ্য" />
            <hr style={{'--stagger-index': 6} as React.CSSProperties} className="my-2 border-slate-300 dark:border-gray-600" />
            {isAdmin ? (
                 <MainMenuButton style={{'--stagger-index': 7} as React.CSSProperties} onClick={onLogout} icon="fa-solid fa-right-from-bracket" text="লগআউট" textColor="text-red-500 dark:text-red-400"/>
            ) : (
                <MainMenuButton style={{'--stagger-index': 7} as React.CSSProperties} onClick={() => onNavigate('admin-login')} icon="fa-solid fa-user-shield" text="এডমিন প্যানেল" textColor="text-slate-600 dark:text-slate-300"/>
            )}
        </div>
    </Card>
  );
};

export default MainMenu;