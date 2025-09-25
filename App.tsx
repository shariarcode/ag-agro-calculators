
import React, { useState, createContext, useContext, useEffect } from 'https://aistudiocdn.com/react@^19.1.1';
import { View, FeedDataItem, CompanyInfoData, FarmInfoData, NoticeItem } from './types';
import MainMenu from './views/MainMenu';
import FeedCalculator from './views/FeedCalculator';
import BroilerCalculator from './views/BroilerCalculator';
import ProfitCalculator from './views/ProfitCalculator';
import CompanyInfo from './views/CompanyInfo';
import FarmInfo from './views/FarmInfo';
import AdminLogin from './views/AdminLogin';
import AdminPanel from './views/AdminPanel';
import AIAssistant from './views/AIAssistant';
import useLocalStorage from './hooks/useLocalStorage';
import { supabase } from './lib/supabaseClient';


// --- Theme Management ---
type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useLocalStorage<Theme>('theme', 'light');

  useEffect(() => {
    const root = window.document.documentElement;
    const isDark = theme === 'dark';
    
    root.classList.remove(isDark ? 'light' : 'dark');
    root.classList.add(theme);

  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="fixed top-5 right-5 z-50 w-12 h-12 rounded-full flex items-center justify-center text-xl bg-[#e0e5ec] text-slate-700 shadow-[5px_5px_10px_#bebebe,_-5px_-5px_10px_#ffffff] active:shadow-[inset_5px_5px_10px_#bebebe,_inset_-5px_-5px_10px_#ffffff] transition-all duration-300 transform active:scale-95 dark:bg-gray-800 dark:text-yellow-300 dark:shadow-[5px_5px_10px_#1c222b,_-5px_-5px_10px_#2c3645] dark:active:shadow-[inset_5px_5px_10px_#1c222b,_inset_-5px_-5px_10px_#2c3645]"
      aria-label="Toggle dark mode"
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
};
// --- End Theme Management ---


const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('main-menu');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State is now fetched from Supabase
  const [feedList, setFeedList] = useState<FeedDataItem[]>([]);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfoData | null>(null);
  const [farmInfo, setFarmInfo] = useState<FarmInfoData | null>(null);
  const [notices, setNotices] = useState<NoticeItem[]>([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Using Promise.all to fetch data concurrently for better performance
        const [feedResponse, companyResponse, farmResponse, noticeResponse] = await Promise.all([
          supabase.from('feed_list').select('*').order('code', { ascending: true }),
          supabase.from('company_info').select('data').limit(1).single(),
          supabase.from('farm_info').select('data').limit(1).single(),
          supabase.from('notices').select('*').order('date', { ascending: false })
        ]);

        if (feedResponse.error) throw new Error(`Feed List: ${feedResponse.error.message}`);
        setFeedList(feedResponse.data || []);

        // Supabase returns { data: { data: { ... } } } for single row with json column
        if (companyResponse.error) throw new Error(`Company Info: ${companyResponse.error.message}`);
        setCompanyInfo(companyResponse.data?.data || null);
        
        if (farmResponse.error) throw new Error(`Farm Info: ${farmResponse.error.message}`);
        setFarmInfo(farmResponse.data?.data || null);

        if (noticeResponse.error) throw new Error(`Notices: ${noticeResponse.error.message}`);
        // Map date to a readable format
        const mappedNotices = (noticeResponse.data || []).map((n: any) => ({...n, date: new Date(n.date).toLocaleString('en-US')}));
        setNotices(mappedNotices);

      } catch (err: any) {
        console.error("Failed to fetch initial data:", err);
        setError(`Failed to load application data: ${err.message}. Please check your connection and Supabase configuration.`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const navigateTo = (view: View) => {
    setCurrentView(view);
  };

  const handleLogin = (email: string) => {
    if (email.toLowerCase() === 'shariararafar123@gmail.com') {
      setIsAdmin(true);
      navigateTo('admin-panel');
    } else {
      alert('Invalid admin email.');
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    navigateTo('main-menu');
  };


  const renderView = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center">
          <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-blue-500"></div>
          <p className="mt-4 text-xl font-semibold text-slate-600 dark:text-slate-300">Loading Data...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
           <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-4">
             <i className="fa-solid fa-triangle-exclamation mr-3"></i>Application Error
           </div>
           <p className="max-w-md text-slate-600 dark:text-slate-300">{error}</p>
           <p className="text-sm text-slate-500 mt-2">Please ensure your Supabase instance is running and the environment variables (SUPABASE_URL, SUPABASE_ANON_KEY) are configured correctly in your deployment settings.</p>
        </div>
      );
    }

    switch (currentView) {
      case 'ai-assistant':
        return farmInfo ? <AIAssistant onBack={() => navigateTo('main-menu')} farmInfoData={farmInfo} /> : <div>Farm info not available.</div>;
      case 'feed-calculator':
        return <FeedCalculator onBack={() => navigateTo('main-menu')} feedData={feedList} notices={notices} />;
      case 'broiler-calculator':
        return <BroilerCalculator onBack={() => navigateTo('main-menu')} />;
      case 'profit-calculator':
        return <ProfitCalculator onBack={() => navigateTo('main-menu')} />;
      case 'company-info':
        return companyInfo ? <CompanyInfo onBack={() => navigateTo('main-menu')} data={companyInfo} /> : <div>Company info not available.</div>;
      case 'farm-info':
        return farmInfo ? <FarmInfo onBack={() => navigateTo('main-menu')} data={farmInfo} /> : <div>Farm info not available.</div>;
      case 'admin-login':
        return <AdminLogin onLogin={handleLogin} onBack={() => navigateTo('main-menu')} />;
      case 'admin-panel':
        if (isAdmin) {
          return (
            <AdminPanel 
              onLogout={handleLogout}
              feedList={feedList}
              setFeedList={setFeedList}
              companyInfo={companyInfo}
              setCompanyInfo={setCompanyInfo}
              farmInfo={farmInfo}
              setFarmInfo={setFarmInfo}
              notices={notices}
              setNotices={setNotices}
            />
          );
        }
        // If not admin, redirect to login
        return <AdminLogin onLogin={handleLogin} onBack={() => navigateTo('main-menu')} />;
      case 'main-menu':
      default:
        return <MainMenu onNavigate={navigateTo} isAdmin={isAdmin} onLogout={handleLogout} />;
    }
  };

  return (
    <div className="flex justify-center items-start min-h-screen p-5 text-[#555] dark:text-gray-300">
      <ThemeToggle />
      <div className="max-w-4xl w-full mx-auto">
        <div key={currentView} className="animate-flipIn">
          {renderView()}
        </div>
      </div>
    </div>
  );
};


const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;