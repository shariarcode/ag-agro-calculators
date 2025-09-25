
import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import InputGroup from '../components/InputGroup';
import { supabase } from '../lib/supabaseClient';
import { BroilerHistoryItem } from '../types';

interface BroilerCalculatorProps {
  onBack: () => void;
}

interface BroilerResult {
    avgWeightPerBird: string;
    fcr: string;
    avgWeightPerBag: string;
}

const BroilerCalculator: React.FC<BroilerCalculatorProps> = ({ onBack }) => {
    const [history, setHistory] = useState<BroilerHistoryItem[]>([]);
    const [isHistoryLoading, setIsHistoryLoading] = useState(true);

    const [farmerName, setFarmerName] = useState('');
    const [farmerMobile, setFarmerMobile] = useState('');
    const [farmerAddress, setFarmerAddress] = useState('');
    const [totalBirds, setTotalBirds] = useState('');
    const [feedConsumed, setFeedConsumed] = useState('');
    const [totalWeight, setTotalWeight] = useState('');
    const [age, setAge] = useState('');

    const [result, setResult] = useState<BroilerResult | null>(null);
    const [error, setError] = useState('');
    
    const inputStyles = "w-full p-3 bg-[#e0e5ec] rounded-xl shadow-[inset_5px_5px_10px_#bebebe,_inset_-5px_-5px_10px_#ffffff] focus:shadow-[inset_3px_3px_7px_#bebebe,_inset_-3px_-3px_7px_#ffffff] outline-none transition-shadow duration-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 dark:shadow-[inset_5px_5px_10px_#1c222b,_inset_-5px_-5px_10px_#2c3645] dark:focus:shadow-[inset_3px_3px_7px_#1c222b,_inset_-3px_-3px_7px_#2c3645]";
    const buttonStyles = "w-full p-3.5 rounded-xl font-bold transition-all duration-200 transform active:scale-[0.98]";

    useEffect(() => {
        const fetchHistory = async () => {
            setIsHistoryLoading(true);
            const { data, error } = await supabase.from('broiler_history').select('*').order('timestamp', { ascending: false });
            if (error) {
                console.error("Error fetching broiler history:", error);
                alert('Could not load saved history.');
            } else if (data) {
                const mappedHistory: BroilerHistoryItem[] = data.map(item => ({
                    id: item.id,
                    timestamp: new Date(item.timestamp).toLocaleString('bn-BD'),
                    farmerName: item.farmer_name,
                    farmerMobile: item.farmer_mobile,
                    farmerAddress: item.farmer_address,
                    totalBirds: item.total_birds,
                    feedConsumed: item.feed_consumed,
                    totalWeight: item.total_weight,
                    age: item.age,
                    avgWeightPerBird: item.avg_weight_per_bird,
                    fcr: item.fcr,
                    perBagWeight: item.per_bag_weight,
                }));
                setHistory(mappedHistory);
            }
            setIsHistoryLoading(false);
        };
        fetchHistory();
    }, []);

    const calculateMetrics = () => {
        const birds = parseInt(totalBirds);
        const feed = parseFloat(feedConsumed);
        const weight = parseFloat(totalWeight);
        const ageNum = parseInt(age);

        if (!farmerName || !farmerMobile || !farmerAddress || isNaN(birds) || isNaN(feed) || isNaN(weight) || isNaN(ageNum)) {
            setError('⚠️ সব ঘর পূরণ করুন');
            setResult(null);
            return;
        }
        
        const avgWeightPerBird = (weight / birds).toFixed(2);
        const fcr = (feed / weight).toFixed(2);
        const bagsConsumed = feed / 50;
        const avgWeightPerBag = (bagsConsumed > 0 ? (weight / bagsConsumed) : 0).toFixed(2);

        setResult({ avgWeightPerBird, fcr, avgWeightPerBag });
        setError('');
    };
    
    const saveResult = async () => {
        const birdsNum = parseInt(totalBirds);
        const feedNum = parseFloat(feedConsumed);
        const weightNum = parseFloat(totalWeight);
        const ageNum = parseInt(age);

        if (!result || !farmerName || !farmerMobile || !farmerAddress || isNaN(birdsNum) || isNaN(feedNum) || isNaN(weightNum) || isNaN(ageNum)) {
            alert("⚠️ সব ঘর পূরণ না করে সেভ করা যাবে না!");
            return;
        }

        const historyToSave = {
            farmer_name: farmerName,
            farmer_mobile: farmerMobile,
            farmer_address: farmerAddress,
            total_birds: birdsNum,
            feed_consumed: feedNum,
            total_weight: weightNum,
            age: ageNum,
            avg_weight_per_bird: result.avgWeightPerBird,
            fcr: result.fcr,
            per_bag_weight: result.avgWeightPerBag,
        };
        
        const { data, error } = await supabase.from('broiler_history').insert(historyToSave).select().single();

        if (error) {
            alert("❌ হিসাব সেভ করা যায়নি!");
            console.error(error);
        } else if (data) {
             const newHistoryItem: BroilerHistoryItem = {
                id: data.id,
                timestamp: new Date(data.timestamp).toLocaleString('bn-BD'),
                farmerName: data.farmer_name,
                farmerMobile: data.farmer_mobile,
                farmerAddress: data.farmer_address,
                totalBirds: data.total_birds,
                feedConsumed: data.feed_consumed,
                totalWeight: data.total_weight,
                age: data.age,
                avgWeightPerBird: data.avg_weight_per_bird,
                fcr: data.fcr,
                perBagWeight: data.per_bag_weight,
            };
            setHistory([newHistoryItem, ...history]);
            alert("✅ হিসাব History তে সেভ হয়েছে!");
        }
    };
    
    const deleteHistory = async (id: number) => {
        if(window.confirm("আপনি কি এই হিসাবটি ডিলিট করতে চান?")) {
            const { error } = await supabase.from('broiler_history').delete().match({ id });
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
                📊 ব্রয়লার FCR ক্যাল্কুলেটর
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InputGroup label="খামারীর নাম" icon="👨‍🌾">
                    <input value={farmerName} onChange={e => setFarmerName(e.target.value)} type="text" placeholder="উদাহরণ:মো সাইফুল ইসলাম" className={inputStyles}/>
                </InputGroup>
                <InputGroup label="মোবাইল" icon="📞">
                    <input value={farmerMobile} onChange={e => setFarmerMobile(e.target.value)} type="text" placeholder="উদাহরণ: 018XXXXXXXX" className={inputStyles}/>
                </InputGroup>
                <InputGroup label="ঠিকানা" icon="📍" className="md:col-span-2">
                    <input value={farmerAddress} onChange={e => setFarmerAddress(e.target.value)} type="text" placeholder="উদাহরণ: নোয়াখালী, বাংলাদেশ" className={inputStyles}/>
                </InputGroup>
                <InputGroup label="মোট মুরগীর সংখ্যা" icon="🐓">
                    <input value={totalBirds} onChange={e => setTotalBirds(e.target.value)} type="number" placeholder="উদাহরণ: 1000" className={inputStyles}/>
                </InputGroup>
                <InputGroup label="মোট খাওয়া খাবার (কেজি)" icon="🥬">
                    <input value={feedConsumed} onChange={e => setFeedConsumed(e.target.value)} type="number" placeholder="উদাহরণ: 2500" className={inputStyles}/>
                </InputGroup>
                <InputGroup label="মোট মুরগীর ওজন (কেজি)" icon="⚖️">
                    <input value={totalWeight} onChange={e => setTotalWeight(e.target.value)} type="number" placeholder="উদাহরণ: 1800" className={inputStyles}/>
                </InputGroup>
                <InputGroup label="মুরগীর বয়স (দিন)" icon="📅">
                    <input value={age} onChange={e => setAge(e.target.value)} type="number" placeholder="উদাহরণ: 30" className={inputStyles}/>
                </InputGroup>
                <div className="md:col-span-2">
                    <button onClick={calculateMetrics} className={`${buttonStyles} text-blue-600 dark:text-blue-400 shadow-[5px_5px_10px_#bebebe,_-5px_-5px_10px_#ffffff] active:shadow-[inset_5px_5px_10px_#bebebe,_inset_-5px_-5px_10px_#ffffff] dark:shadow-[5px_5px_10px_#1c222b,_-5px_-5px_10px_#2c3645] dark:active:shadow-[inset_5px_5px_10px_#1c222b,_inset_-5px_-5px_10px_#2c3645]`}>হিসাব করুন</button>
                </div>
            </div>

            {(result || error) && (
                 <div className="mt-6 p-5 rounded-xl relative shadow-[inset_5px_5px_10px_#bebebe,_inset_-5px_-5px_10px_#ffffff] dark:shadow-[inset_5px_5px_10px_#1c222b,_inset_-5px_-5px_10px_#2c3645] animate-scaleUp">
                     {error && <p className="text-red-600 font-semibold">{error}</p>}
                     {result && (
                         <>
                             <button onClick={saveResult} className="absolute top-4 right-4 text-orange-500 dark:text-orange-400 w-10 h-10 rounded-full flex items-center justify-center shadow-[3px_3px_6px_#bebebe,_-3px_-3px_6px_#ffffff] active:shadow-[inset_3px_3px_6px_#bebebe,_inset_-3px_-3px_6px_#ffffff] dark:shadow-[3px_3px_6px_#1c222b,_-3px_-3px_6px_#2c3645] dark:active:shadow-[inset_3px_3px_6px_#1c222b,_inset_-3px_-3px_6px_#2c3645] transition-all text-lg">💾</button>
                             <p><strong>👨‍🌾 নাম:</strong> {farmerName}</p>
                             <p><strong>📞 মোবাইল:</strong> {farmerMobile}</p>
                             <p><strong>📍 ঠিকানা:</strong> {farmerAddress}</p>
                             <hr className="my-2 border-slate-300 dark:border-gray-600"/>
                             <p><strong>📅 বয়স:</strong> {age} দিন</p>
                             <p><strong>⚖️ মোট ওজন:</strong> {totalWeight} কেজি</p>
                             <p><strong>🐓 গড় ওজন:</strong> {result.avgWeightPerBird} কেজি</p>
                             <p><strong>🥬 খাবার:</strong> {feedConsumed} কেজি</p>
                             <p><strong>📊 FCR:</strong> {result.fcr}</p>
                             <p><strong>🧮 ১ বস্তায় ওজন:</strong> {result.avgWeightPerBag} কেজি</p>
                         </>
                     )}
                 </div>
            )}

            <div className="mt-10">
                <h2 className="text-2xl font-bold mb-4 text-slate-700 dark:text-slate-200">📂 History</h2>
                <div className="space-y-4">
                    {isHistoryLoading ? (
                        <p className="text-center text-gray-500 dark:text-gray-400">Loading history...</p>
                    ) : history.length === 0 ? (
                        <p className="text-center text-gray-500 dark:text-gray-400">❌ কোনো হিসাব সেভ করা হয়নি।</p>
                    ) : (
                        history.map((item, index) => (
                            <div key={item.id} className="bg-[#e0e5ec] rounded-xl p-4 relative shadow-[5px_5px_10px_#bebebe,_-5px_-5px_10px_#ffffff] dark:bg-gray-700 dark:shadow-[5px_5px_10px_#1c222b,_-5px_-5px_10px_#2c3645] animate-slideInFromBottom" style={{ animationDelay: `${index * 100}ms`}}>
                                <div className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">🕒 {item.timestamp}</div>
                                <p><strong>👨‍🌾 নাম:</strong> {item.farmerName}</p>
                                <p><strong>📞 মোবাইল:</strong> {item.farmerMobile}</p>
                                <p><strong>📍 ঠিকানা:</strong> {item.farmerAddress}</p>
                                <hr className="my-2 border-slate-300/70 dark:border-gray-600"/>
                                <p><strong>📅 বয়স:</strong> {item.age} দিন</p>
                                <p><strong>⚖️ মোট ওজন:</strong> {item.totalWeight} কেজি</p>
                                <p><strong>🐓 গড় ওজন:</strong> {item.avgWeightPerBird} কেজি</p>
                                <p><strong>🥬 খাবার:</strong> {item.feedConsumed} কেজি</p>
                                <p><strong>📊 FCR:</strong> {item.fcr}</p>
                                <p><strong>🧮 ১ বস্তায় ওজন:</strong> {item.perBagWeight} কেজি</p>
                                <button onClick={() => deleteHistory(item.id)} className="absolute top-4 right-4 text-red-500 w-9 h-9 rounded-full flex items-center justify-center shadow-[3px_3px_6px_#bebebe,_-3px_-3px_6px_#ffffff] active:shadow-[inset_3px_3px_6px_#bebebe,_inset_-3px_-3px_6px_#ffffff] dark:shadow-[3px_3px_6px_#1c222b,_-3px_-3px_6px_#2c3645] dark:active:shadow-[inset_3px_3px_6px_#1c222b,_inset_-3px_-3px_6px_#2c3645] transition-all">🗑️</button>
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

export default BroilerCalculator;
