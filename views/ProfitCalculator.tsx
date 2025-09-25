
import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import InputGroup from '../components/InputGroup';
import { supabase } from '../lib/supabaseClient';
import { ProfitHistoryItem } from '../types';

interface ProfitCalculatorProps {
  onBack: () => void;
}

interface ProfitResult {
    totalCost: number;
    totalIncome: number;
    netProfit: number;
    profitPerBird: number;
    costPerKg: number;
}

const formatMoney = (x: number) => {
    if (isNaN(x)) return '০.০০';
    return Number(x).toLocaleString('bn-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const ProfitCalculator: React.FC<ProfitCalculatorProps> = ({ onBack }) => {
    const [history, setHistory] = useState<ProfitHistoryItem[]>([]);
    const [isHistoryLoading, setIsHistoryLoading] = useState(true);

    // Input States
    const [totalChicks, setTotalChicks] = useState('');
    const [chickPrice, setChickPrice] = useState('');
    const [totalFeedCost, setTotalFeedCost] = useState('');
    const [totalMedicineCost, setTotalMedicineCost] = useState('');
    const [totalUtilityCost, setTotalUtilityCost] = useState('');
    const [totalLaborCost, setTotalLaborCost] = useState('');
    const [totalWeightSold, setTotalWeightSold] = useState('');
    const [pricePerKg, setPricePerKg] = useState('');

    const [result, setResult] = useState<ProfitResult | null>(null);
    const [error, setError] = useState('');
    
    const inputStyles = "w-full p-3 bg-[#e0e5ec] rounded-xl shadow-[inset_5px_5px_10px_#bebebe,_inset_-5px_-5px_10px_#ffffff] focus:shadow-[inset_3px_3px_7px_#bebebe,_inset_-3px_-3px_7px_#ffffff] outline-none transition-shadow duration-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 dark:shadow-[inset_5px_5px_10px_#1c222b,_inset_-5px_-5px_10px_#2c3645] dark:focus:shadow-[inset_3px_3px_7px_#1c222b,_inset_-3px_-3px_7px_#2c3645]";
    const buttonStyles = "w-full p-3.5 rounded-xl font-bold transition-all duration-200 transform active:scale-[0.98]";

    useEffect(() => {
        const fetchHistory = async () => {
            setIsHistoryLoading(true);
            const { data, error } = await supabase.from('profit_history').select('*').order('timestamp', { ascending: false });
            if (error) {
                console.error("Error fetching profit history:", error);
                alert('Could not load saved history.');
            } else if (data) {
                const mappedHistory: ProfitHistoryItem[] = data.map(item => ({
                    id: item.id,
                    timestamp: new Date(item.timestamp).toLocaleString('bn-BD'),
                    totalChicks: item.total_chicks,
                    chickPrice: item.chick_price,
                    totalFeedCost: item.total_feed_cost,
                    totalMedicineCost: item.total_medicine_cost,
                    totalUtilityCost: item.total_utility_cost,
                    totalLaborCost: item.total_labor_cost,
                    totalWeightSold: item.total_weight_sold,
                    pricePerKg: item.price_per_kg,
                    totalCost: item.total_cost,
                    totalIncome: item.total_income,
                    netProfit: item.net_profit,
                    profitPerBird: item.profit_per_bird,
                    costPerKg: item.cost_per_kg,
                }));
                setHistory(mappedHistory);
            }
            setIsHistoryLoading(false);
        };
        fetchHistory();
    }, []);

    const calculateProfit = () => {
        const inputs = [totalChicks, chickPrice, totalFeedCost, totalMedicineCost, totalUtilityCost, totalLaborCost, totalWeightSold, pricePerKg];
        if (inputs.some(val => val.trim() === '')) {
            setError('⚠️ সব ঘর পূরণ করুন');
            setResult(null);
            return;
        }

        const chicksNum = parseInt(totalChicks);
        const pricePerChickNum = parseFloat(chickPrice);
        const feedCostNum = parseFloat(totalFeedCost);
        const medicineCostNum = parseFloat(totalMedicineCost);
        const utilityCostNum = parseFloat(totalUtilityCost);
        const laborCostNum = parseFloat(totalLaborCost);
        const weightSoldNum = parseFloat(totalWeightSold);
        const priceKgNum = parseFloat(pricePerKg);

        const allNumbers = [chicksNum, pricePerChickNum, feedCostNum, medicineCostNum, utilityCostNum, laborCostNum, weightSoldNum, priceKgNum];
        if (allNumbers.some(isNaN)) {
             setError('⚠️ অনুগ্রহ করে সঠিক সংখ্যা ইনপুট দিন।');
             setResult(null);
             return;
        }

        const totalChickCost = chicksNum * pricePerChickNum;
        const totalCost = totalChickCost + feedCostNum + medicineCostNum + utilityCostNum + laborCostNum;
        const totalIncome = weightSoldNum * priceKgNum;
        const netProfit = totalIncome - totalCost;
        const profitPerBird = chicksNum > 0 ? netProfit / chicksNum : 0;
        const costPerKg = weightSoldNum > 0 ? totalCost / weightSoldNum : 0;

        setResult({ totalCost, totalIncome, netProfit, profitPerBird, costPerKg });
        setError('');
    };
    
    const saveResult = async () => {
        if (!result) {
            alert("⚠️ হিসাব সেভ করার জন্য প্রথমে হিসাব করুন।");
            return;
        }

        const historyToSave = {
            total_chicks: parseInt(totalChicks),
            chick_price: parseFloat(chickPrice),
            total_feed_cost: parseFloat(totalFeedCost),
            total_medicine_cost: parseFloat(totalMedicineCost),
            total_utility_cost: parseFloat(totalUtilityCost),
            total_labor_cost: parseFloat(totalLaborCost),
            total_weight_sold: parseFloat(totalWeightSold),
            price_per_kg: parseFloat(pricePerKg),
            ...result,
            net_profit: result.netProfit,
            profit_per_bird: result.profitPerBird,
            cost_per_kg: result.costPerKg,
            total_cost: result.totalCost,
            total_income: result.totalIncome,
        };
        
        const { data, error } = await supabase.from('profit_history').insert(historyToSave).select().single();

        if (error) {
            alert("❌ হিসাব সেভ করা যায়নি!");
            console.error(error);
        } else if (data) {
            const newHistoryItem: ProfitHistoryItem = {
                id: data.id,
                timestamp: new Date(data.timestamp).toLocaleString('bn-BD'),
                totalChicks: data.total_chicks,
                chickPrice: data.chick_price,
                totalFeedCost: data.total_feed_cost,
                totalMedicineCost: data.total_medicine_cost,
                totalUtilityCost: data.total_utility_cost,
                totalLaborCost: data.total_labor_cost,
                totalWeightSold: data.total_weight_sold,
                pricePerKg: data.price_per_kg,
                totalCost: data.total_cost,
                totalIncome: data.total_income,
                netProfit: data.net_profit,
                profitPerBird: data.profit_per_bird,
                costPerKg: data.cost_per_kg,
            };
            setHistory([newHistoryItem, ...history]);
            alert("✅ হিসাব সেভ হয়েছে!");
        }
    };
    
    const deleteHistory = async (id: number) => {
        if(window.confirm("আপনি কি এই হিসাবটি ডিলিট করতে চান?")) {
            const { error } = await supabase.from('profit_history').delete().match({ id });
            if (error) {
                alert("❌ হিসাব ডিলিট করা যায়নি!");
                console.error(error);
            } else {
                setHistory(history.filter(item => item.id !== id));
            }
        }
    };
    
    return (
        <Card>
            <h1 className="text-3xl font-bold text-center mb-6 text-slate-700 dark:text-slate-200 flex items-center justify-center gap-3">
                <i className="fa-solid fa-chart-line"></i> লাভ/ক্ষতি ক্যাল্কুলেটর
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                <div className="md:col-span-2 p-4 rounded-xl shadow-[inset_3px_3px_6px_#bebebe,_inset_-3px_-3px_6px_#ffffff] dark:shadow-[inset_3px_3px_6px_#1c222b,_inset_-3px_-3px_6px_#2c3645]">
                    <h2 className="text-xl font-bold text-slate-600 dark:text-slate-300 mb-3 border-b-2 border-slate-300 dark:border-gray-600 pb-2">খরচের হিসাব</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputGroup label="বাচ্চার সংখ্যা"><input value={totalChicks} onChange={e => setTotalChicks(e.target.value)} type="number" placeholder="যেমন: 1000" className={inputStyles}/></InputGroup>
                        <InputGroup label="প্রতি বাচ্চার দাম"><input value={chickPrice} onChange={e => setChickPrice(e.target.value)} type="number" placeholder="যেমন: 55" className={inputStyles}/></InputGroup>
                        <InputGroup label="মোট খাবারের খরচ"><input value={totalFeedCost} onChange={e => setTotalFeedCost(e.target.value)} type="number" placeholder="যেমন: 250000" className={inputStyles}/></InputGroup>
                        <InputGroup label="মোট ঔষধের খরচ"><input value={totalMedicineCost} onChange={e => setTotalMedicineCost(e.target.value)} type="number" placeholder="যেমন: 15000" className={inputStyles}/></InputGroup>
                        <InputGroup label="বিদ্যুৎ ও অন্যান্য খরচ"><input value={totalUtilityCost} onChange={e => setTotalUtilityCost(e.target.value)} type="number" placeholder="যেমন: 5000" className={inputStyles}/></InputGroup>
                        <InputGroup label="শ্রমিক খরচ"><input value={totalLaborCost} onChange={e => setTotalLaborCost(e.target.value)} type="number" placeholder="যেমন: 10000" className={inputStyles}/></InputGroup>
                    </div>
                </div>
                 <div className="md:col-span-2 p-4 rounded-xl shadow-[inset_3px_3px_6px_#bebebe,_inset_-3px_-3px_6px_#ffffff] dark:shadow-[inset_3px_3px_6px_#1c222b,_inset_-3px_-3px_6px_#2c3645]">
                    <h2 className="text-xl font-bold text-slate-600 dark:text-slate-300 mb-3 border-b-2 border-slate-300 dark:border-gray-600 pb-2">আয়ের হিসাব</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputGroup label="মোট বিক্রিত ওজন (কেজি)"><input value={totalWeightSold} onChange={e => setTotalWeightSold(e.target.value)} type="number" placeholder="যেমন: 1800" className={inputStyles}/></InputGroup>
                        <InputGroup label="প্রতি কেজি বিক্রয় মূল্য"><input value={pricePerKg} onChange={e => setPricePerKg(e.target.value)} type="number" placeholder="যেমন: 180" className={inputStyles}/></InputGroup>
                    </div>
                </div>
                <div className="md:col-span-2">
                    <button onClick={calculateProfit} className={`${buttonStyles} text-blue-600 dark:text-blue-400 shadow-[5px_5px_10px_#bebebe,_-5px_-5px_10px_#ffffff] active:shadow-[inset_5px_5px_10px_#bebebe,_inset_-5px_-5px_10px_#ffffff] dark:shadow-[5px_5px_10px_#1c222b,_-5px_-5px_10px_#2c3645] dark:active:shadow-[inset_5px_5px_10px_#1c222b,_inset_-5px_-5px_10px_#2c3645] flex items-center justify-center gap-2`}><i className="fa-solid fa-equals"></i> হিসাব করুন</button>
                </div>
            </div>

            {(result || error) && (
                 <div className="mt-6 p-5 rounded-xl relative shadow-[inset_5px_5px_10px_#bebebe,_inset_-5px_-5px_10px_#ffffff] dark:shadow-[inset_5px_5px_10px_#1c222b,_inset_-5px_-5px_10px_#2c3645] animate-scaleUp">
                     {error && <p className="text-center text-red-600 font-bold text-lg">{error}</p>}
                     {result && (
                         <>
                            <h3 className="text-2xl font-bold text-center mb-4 text-slate-700 dark:text-slate-200">ফলাফল</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-700 dark:text-slate-200">
                                <p><strong>মোট খরচ:</strong> {formatMoney(result.totalCost)} টাকা</p>
                                <p><strong>মোট আয়:</strong> {formatMoney(result.totalIncome)} টাকা</p>
                                <p className={`md:col-span-2 text-xl font-bold p-3 my-2 text-center rounded-lg ${result.netProfit >= 0 ? 'bg-green-200 text-green-800 dark:bg-green-800/50 dark:text-green-300' : 'bg-red-200 text-red-800 dark:bg-red-800/50 dark:text-red-300'}`}>
                                    {result.netProfit >= 0 ? 'লাভ' : 'ক্ষতি'}: {formatMoney(result.netProfit)} টাকা
                                </p>
                                <p><strong>প্রতি মুরগিতে লাভ/ক্ষতি:</strong> {formatMoney(result.profitPerBird)} টাকা</p>
                                <p><strong>প্রতি কেজি উৎপাদন খরচ:</strong> {formatMoney(result.costPerKg)} টাকা</p>
                            </div>
                            <button onClick={saveResult} className="absolute top-4 right-4 text-blue-500 dark:text-blue-400 w-10 h-10 rounded-full flex items-center justify-center shadow-[3px_3px_6px_#bebebe,_-3px_-3px_6px_#ffffff] active:shadow-[inset_3px_3px_6px_#bebebe,_inset_-3px_-3px_6px_#ffffff] dark:shadow-[3px_3px_6px_#1c222b,_-3px_-3px_6px_#2c3645] dark:active:shadow-[inset_3px_3px_6px_#1c222b,_inset_-3px_-3px_6px_#2c3645] transition-all text-lg" aria-label="Save result">
                                <i className="fa-solid fa-floppy-disk"></i>
                            </button>
                         </>
                     )}
                 </div>
            )}

            <div className="mt-10 pt-5 border-t-2 border-dashed border-slate-300 dark:border-gray-600">
                <h2 className="text-2xl font-bold mb-4 text-slate-700 dark:text-slate-200"><i className="fa-solid fa-clock-rotate-left mr-2"></i> সেভ করা হিসাব</h2>
                <div className="space-y-4">
                    {isHistoryLoading ? (
                        <p className="text-center text-gray-500 dark:text-gray-400">Loading history...</p>
                    ) : history.length === 0 ? (
                        <p className="text-center text-gray-500 dark:text-gray-400">❌ কোনো হিসাব সেভ করা হয়নি।</p>
                    ) : (
                        history.map((item, index) => (
                            <div key={item.id} className="bg-[#e0e5ec] rounded-xl p-4 relative shadow-[5px_5px_10px_#bebebe,_-5px_-5px_10px_#ffffff] dark:bg-gray-800 dark:shadow-[5px_5px_10px_#1c222b,_-5px_-5px_10px_#2c3645] animate-slideInFromBottom" style={{ animationDelay: `${index * 100}ms`}}>
                                <div className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">🕒 {item.timestamp}</div>
                                <div className={`text-center font-bold text-lg p-2 rounded-lg mb-2 ${item.netProfit >= 0 ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300'}`}>
                                    {item.netProfit >= 0 ? 'লাভ' : 'ক্ষতি'}: {formatMoney(item.netProfit)} টাকা
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1 text-sm">
                                    <p><strong>মোট খরচ:</strong> {formatMoney(item.totalCost)}</p>
                                    <p><strong>মোট আয়:</strong> {formatMoney(item.totalIncome)}</p>
                                    <p><strong>প্রতি মুরগিতে লাভ:</strong> {formatMoney(item.profitPerBird)}</p>
                                    <p><strong>উৎপাদন খরচ/কেজি:</strong> {formatMoney(item.costPerKg)}</p>
                                    <p><strong>বাচ্চার সংখ্যা:</strong> {item.totalChicks}</p>
                                    <p><strong>বিক্রিত ওজন:</strong> {item.totalWeightSold} কেজি</p>
                                </div>
                                <button onClick={() => deleteHistory(item.id)} className="absolute top-4 right-4 text-red-500 w-9 h-9 rounded-full flex items-center justify-center shadow-[3px_3px_6px_#bebebe,_-3px_-3px_6px_#ffffff] active:shadow-[inset_3px_3px_6px_#bebebe,_inset_-3px_-3px_6px_#ffffff] dark:shadow-[3px_3px_6px_#1c222b,_-3px_-3px_6px_#2c3645] dark:active:shadow-[inset_3px_3px_6px_#1c222b,_inset_-3px_-3px_6px_#2c3645] transition-all" aria-label="Delete history item">
                                  <i className="fa-solid fa-trash"></i>
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <button onClick={onBack} className={`${buttonStyles} mt-8 text-purple-600 dark:text-purple-400 shadow-[5px_5px_10px_#bebebe,_-5px_-5px_10px_#ffffff] active:shadow-[inset_5px_5px_10px_#bebebe,_inset_-5px_-5px_10px_#ffffff] dark:shadow-[5px_5px_10px_#1c222b,_-5px_-5px_10px_#2c3645] dark:active:shadow-[inset_5px_5px_10px_#1c222b,_inset_-5px_-5px_10px_#2c3645] flex items-center justify-center gap-2`}>
                <i className="fa-solid fa-arrow-left"></i> মেনুতে ফিরে যান
            </button>
        </Card>
    );
};

export default ProfitCalculator;
