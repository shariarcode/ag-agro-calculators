
import React, { useState, useEffect, useRef } from 'https://aistudiocdn.com/react@^19.1.1';
import Card from '../components/Card';
import InputGroup from '../components/InputGroup';
import { supabase } from '../lib/supabaseClient';
import { FeedCartItem, FeedHistoryItem, FeedDataItem, NoticeItem } from '../types';

declare var jspdf: any;

interface FeedCalculatorProps {
  onBack: () => void;
  feedData: FeedDataItem[];
  notices: NoticeItem[];
}

const formatMoney = (x: number) => Number(x).toLocaleString('bn-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const normalize = (s: string) => (s || '').toString().trim().replace(/\s+/g, ' ').toUpperCase();

const FeedCalculator: React.FC<FeedCalculatorProps> = ({ onBack, feedData, notices }) => {
  const [cart, setCart] = useState<FeedCartItem[]>([]);
  const [history, setHistory] = useState<FeedHistoryItem[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  
  const [shopName, setShopName] = useState('');
  const [codeInput, setCodeInput] = useState('');
  const [bags, setBags] = useState('');
  const [discount, setDiscount] = useState('6.5');
  const [commission, setCommission] = useState('5000');
  
  const [suggestions, setSuggestions] = useState<FeedDataItem[]>([]);
  const [selectedFeed, setSelectedFeed] = useState<FeedDataItem | null>(null);
  const [isAutocompleteVisible, setAutocompleteVisible] = useState(false);
  const autocompleteRef = useRef<HTMLDivElement>(null);
  
  const activeNotices = notices.filter(notice => notice.isActive);

  useEffect(() => {
    const fetchHistory = async () => {
      setIsHistoryLoading(true);
      const { data, error } = await supabase
        .from('feed_history')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) {
        console.error("Error fetching feed history:", error);
        alert('Could not load saved history.');
      } else if (data) {
        const mappedHistory: FeedHistoryItem[] = data.map(item => ({
          id: item.id,
          timestamp: new Date(item.timestamp).toLocaleString('bn-BD', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' }),
          shopName: item.shop_name,
          items: item.items,
          totalAmount: item.total_amount,
          totalBags: item.total_bags,
          totalKg: item.total_kg,
        }));
        setHistory(mappedHistory);
      }
      setIsHistoryLoading(false);
    };
    fetchHistory();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target as Node)) {
        setAutocompleteVisible(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCodeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = normalize(e.target.value);
    setCodeInput(e.target.value);
    setSelectedFeed(null);

    if (query.length > 0) {
      const matches = feedData.filter(f => normalize(f.code).startsWith(query));
      setSuggestions(matches);
      setAutocompleteVisible(matches.length > 0);
    } else {
      setAutocompleteVisible(false);
    }
  };

  const handleSuggestionClick = (feed: FeedDataItem) => {
    setCodeInput(feed.code);
    setSelectedFeed(feed);
    setAutocompleteVisible(false);
  };

  const handleAddToCart = () => {
    const feedToAdd = selectedFeed || feedData.find(f => normalize(f.code) === normalize(codeInput));
    const bagCount = parseInt(bags);

    if (!feedToAdd || isNaN(bagCount) || bagCount <= 0) {
      alert("❌ একটি ফিড নির্বাচন করুন এবং সঠিক ব্যাগ সংখ্যা দিন");
      return;
    }

    const totalKg = bagCount * feedToAdd.kg;
    const totalGrossPrice = feedToAdd.price * bagCount;
    const discountAmount = (totalGrossPrice * (parseFloat(discount) || 0)) / 100;
    const commissionAmount = (totalKg / 1000) * (parseFloat(commission) || 0);
    const finalPrice = totalGrossPrice - discountAmount - commissionAmount;

    setCart([...cart, { code: feedToAdd.code, name: feedToAdd.name, bags: bagCount, kg: totalKg, final: finalPrice }]);
    setCodeInput('');
    setBags('');
    setSelectedFeed(null);
  };
  
  const handleRemoveFromCart = (index: number) => {
      setCart(cart.filter((_, i) => i !== index));
  };
  
  const handleSaveHistory = async () => {
      if(cart.length === 0) {
          alert("❌ সেভ করার জন্য কার্টে কোনো ফিড নেই।");
          return;
      }
      const totalTk = cart.reduce((acc, item) => acc + item.final, 0);
      const totalBags = cart.reduce((acc, item) => acc + item.bags, 0);
      const totalKg = cart.reduce((acc, item) => acc + item.kg, 0);
      
      const historyToSave = {
          shop_name: shopName || 'দোকানের নাম নেই',
          items: cart,
          total_amount: totalTk,
          total_bags: totalBags,
          total_kg: totalKg,
      };

      const { data, error } = await supabase.from('feed_history').insert(historyToSave).select().single();

      if (error) {
          alert("❌ কেনাকাটার হিসাব সেভ করা যায়নি!");
          console.error(error);
      } else if (data) {
          const newHistoryItem: FeedHistoryItem = {
            id: data.id,
            timestamp: new Date(data.timestamp).toLocaleString('bn-BD', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' }),
            shopName: data.shop_name,
            items: data.items,
            totalAmount: data.total_amount,
            totalBags: data.total_bags,
            totalKg: data.total_kg,
          };
          setHistory([newHistoryItem, ...history]);
          setCart([]);
          setShopName('');
          alert("✅ কেনাকাটার হিসাব সেভ হয়েছে!");
      }
  };

  const handleDeleteHistory = async (id: number) => {
      if(window.confirm("আপনি কি এই হিস্টোরিটি ডিলিট করতে চান?")) {
          const { error } = await supabase.from('feed_history').delete().match({ id });
          if (error) {
              alert("❌ হিসাব ডিলিট করা যায়নি!");
              console.error(error);
          } else {
              setHistory(history.filter(item => item.id !== id));
          }
      }
  };

  const handleExportHistoryPdf = () => {
    if (history.length === 0) {
        alert("❌ কোনো হিসাব এক্সপোর্ট করার জন্য নেই।");
        return;
    }

    try {
        const { jsPDF } = jspdf;
        const doc = new jsPDF();

        // Note: Bengali characters may not render correctly without a proper font embedded.
        // This is a limitation of jsPDF without access to the .ttf font file.
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.text("Feed Purchase History", doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });

        let startY = 25;

        history.forEach((item) => {
            const tableBody = item.items.map(cartItem => [
                cartItem.code,
                cartItem.name,
                cartItem.bags.toString(),
                `${cartItem.kg} kg`,
                formatMoney(cartItem.final),
            ]);
            
            const totalRow = [
                { content: 'Total', colSpan: 2, styles: { halign: 'right', fontStyle: 'bold' } },
                { content: item.totalBags, styles: { fontStyle: 'bold' } },
                { content: `${item.totalKg} kg`, styles: { fontStyle: 'bold' } },
                { content: formatMoney(item.totalAmount), styles: { fontStyle: 'bold' } }
            ];
            
            // @ts-ignore
            tableBody.push(totalRow);


            // Check for page overflow before adding content
            const tableHeight = (item.items.length + 3) * 10 + 20; // Approximate height
            if (startY + tableHeight > doc.internal.pageSize.getHeight()) {
                doc.addPage();
                startY = 15;
            }
            
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text(`Shop: ${item.shopName}`, 14, startY);

            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.text(`Date: ${item.timestamp}`, 14, startY + 5);

            startY += 10;

            doc.autoTable({
                head: [['Code', 'Name', 'Bags', 'KG', 'Final Price (Tk)']],
                body: tableBody,
                startY: startY,
                theme: 'grid',
                headStyles: { fillColor: [41, 128, 185], textColor: 255 },
                styles: { font: 'helvetica', fontSize: 10 },
            });

            startY = (doc as any).autoTable.previous.finalY + 15;
        });

        doc.save('feed-history.pdf');
    } catch (e) {
        alert('An error occurred while exporting the PDF.');
        console.error("PDF Export Error: ", e);
    }
  };

  const totalBags = cart.reduce((acc, item) => acc + item.bags, 0);
  const totalKg = cart.reduce((acc, item) => acc + item.kg, 0);
  const totalTk = cart.reduce((acc, item) => acc + item.final, 0);

  const inputStyles = "w-full p-3 bg-[#e0e5ec] rounded-xl shadow-[inset_5px_5px_10px_#bebebe,_inset_-5px_-5px_10px_#ffffff] focus:shadow-[inset_3px_3px_7px_#bebebe,_inset_-3px_-3px_7px_#ffffff] outline-none transition-shadow duration-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 dark:shadow-[inset_5px_5px_10px_#1c222b,_inset_-5px_-5px_10px_#2c3645] dark:focus:shadow-[inset_3px_3px_7px_#1c222b,_inset_-3px_-3px_7px_#2c3645]";
  const buttonStyles = "w-full p-3.5 rounded-xl font-bold transition-all duration-200 transform active:scale-[0.98]";

  return (
    <Card>
       {activeNotices.length > 0 && (
        <div className="mb-6 p-4 rounded-xl bg-[#e0e5ec] dark:bg-gray-800 shadow-[inset_5px_5px_10px_#bebebe,_inset_-5px_-5px_10px_#ffffff] dark:shadow-[inset_5px_5px_10px_#1c222b,_inset_-5px_-5px_10px_#2c3645] animate-scaleUp">
            <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200 flex items-center gap-3 mb-2 pb-2 border-b-2 border-slate-300 dark:border-gray-600">
                <i className="fa-solid fa-bullhorn text-yellow-500"></i> জরুরী নোটিশ
            </h2>
            <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                {activeNotices.map(notice => (
                    <div key={notice.id} className="animate-slideInFromBottom" style={{ animationDelay: `${notice.id % 5 * 50}ms`}}>
                        <h3 className="font-semibold text-slate-700 dark:text-slate-200">{notice.title}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{notice.content}</p>
                    </div>
                ))}
            </div>
        </div>
      )}

      <h1 className="text-3xl font-bold text-center mb-6 text-slate-700 dark:text-slate-200 flex items-center justify-center gap-3">
        <i className="fa-solid fa-calculator"></i> ফিড কার্ট ক্যাল্কুলেটর
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <InputGroup label="দোকানের নাম" icon="fa-solid fa-store">
          <input value={shopName} onChange={e => setShopName(e.target.value)} type="text" placeholder="দোকানের নাম বা মালিকের নাম" className={inputStyles} />
        </InputGroup>
        
        <div className="relative" ref={autocompleteRef}>
          <InputGroup label="ফিড কোড" icon="fa-solid fa-barcode">
            <input value={codeInput} onChange={handleCodeInputChange} onFocus={handleCodeInputChange} type="text" placeholder="যেমন: 701 C" autoComplete="off" className={inputStyles} />
          </InputGroup>
          {isAutocompleteVisible && (
            <div className="absolute w-full mt-2 bg-[#e0e5ec] rounded-xl shadow-[5px_5px_10px_#bebebe,_-5px_-5px_10px_#ffffff] max-h-60 overflow-y-auto z-10 dark:bg-gray-700 dark:shadow-[5px_5px_10px_#1c222b,_-5px_-5px_10px_#2c3645]">
              {suggestions.map((s, i) => (
                <div key={i} onClick={() => handleSuggestionClick(s)} className="p-3 cursor-pointer hover:bg-slate-200 rounded-lg dark:hover:bg-gray-600">
                  {s.code} - {s.name} ({s.kg} কেজি) - MRP: {formatMoney(s.price)} টাকা
                </div>
              ))}
            </div>
          )}
        </div>

        <InputGroup label="ব্যাগ সংখ্যা" icon="fa-solid fa-bag-shopping">
          <input value={bags} onChange={e => setBags(e.target.value)} type="number" placeholder="যেমন: 10" min="1" step="1" className={inputStyles} />
        </InputGroup>
        
        <InputGroup label="ডিসকাউন্ট (%)" icon="fa-solid fa-tag">
          <input value={discount} onChange={e => setDiscount(e.target.value)} type="number" placeholder="যেমন: 6.5" min="0" step="0.01" className={inputStyles} />
        </InputGroup>

        <InputGroup label="কমিশন (প্রতি টন)" icon="fa-solid fa-handshake" className="md:col-span-2">
          <input value={commission} onChange={e => setCommission(e.target.value)} type="number" placeholder="যেমন: 5000" min="0" step="1" className={inputStyles} />
        </InputGroup>
        
        <div className="md:col-span-2">
          <button onClick={handleAddToCart} className={`${buttonStyles} text-blue-600 dark:text-blue-400 shadow-[5px_5px_10px_#bebebe,_-5px_-5px_10px_#ffffff] active:shadow-[inset_5px_5px_10px_#bebebe,_inset_-5px_-5px_10px_#ffffff] dark:shadow-[5px_5px_10px_#1c222b,_-5px_-5px_10px_#2c3645] dark:active:shadow-[inset_5px_5px_10px_#1c222b,_inset_-5px_-5px_10px_#2c3645] flex items-center justify-center gap-2`}>
            <i className="fa-solid fa-cart-plus"></i> কার্টে যোগ করুন
          </button>
        </div>
      </div>

      {cart.length > 0 && (
        <div className="mt-8 animate-scaleUp">
            <div className="overflow-x-auto rounded-xl shadow-[inset_5px_5px_10px_#bebebe,_inset_-5px_-5px_10px_#ffffff] dark:shadow-[inset_5px_5px_10px_#1c222b,_inset_-5px_-5px_10px_#2c3645] p-2">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="border-b-2 border-slate-300 dark:border-gray-600">
                            <th className="p-4 text-center font-bold text-slate-600 dark:text-slate-300">কোড</th>
                            <th className="p-4 text-center font-bold text-slate-600 dark:text-slate-300">নাম</th>
                            <th className="p-4 text-center font-bold text-slate-600 dark:text-slate-300">ব্যাগ</th>
                            <th className="p-4 text-center font-bold text-slate-600 dark:text-slate-300">কেজি</th>
                            <th className="p-4 text-center font-bold text-slate-600 dark:text-slate-300"> চূড়ান্ত দাম (Tk)</th>
                            <th className="p-4 text-center font-bold text-slate-600 dark:text-slate-300">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cart.map((item, index) => (
                            <tr key={index} className="border-t border-slate-300/70 dark:border-gray-700 animate-slideInFromBottom" style={{ animationDelay: `${index * 50}ms`}}>
                                <td className="p-4 text-center">{item.code}</td>
                                <td className="p-4 text-center">{item.name}</td>
                                <td className="p-4 text-center">{item.bags}</td>
                                <td className="p-4 text-center">{item.kg} কেজি</td>
                                <td className="p-4 text-center">{formatMoney(item.final)} টাকা</td>
                                <td className="p-4 text-center">
                                    <button onClick={() => handleRemoveFromCart(index)} className="text-red-500 dark:text-red-400 font-bold px-3 py-1.5 rounded-lg shadow-[3px_3px_6px_#bebebe,_-3px_-3px_6px_#ffffff] active:shadow-[inset_3px_3px_6px_#bebebe,_inset_-3px_-3px_6px_#ffffff] dark:shadow-[3px_3px_6px_#1c222b,_-3px_-3px_6px_#2c3645] dark:active:shadow-[inset_3px_3px_6px_#1c222b,_inset_-3px_-3px_6px_#2c3645] transition-all text-sm">
                                        <i className="fa-solid fa-trash"></i> বাতিল
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="mt-6 p-5 rounded-xl text-slate-700 dark:text-slate-200 font-semibold text-center text-lg shadow-[inset_5px_5px_10px_#bebebe,_inset_-5px_-5px_10px_#ffffff] dark:shadow-[inset_5px_5px_10px_#1c222b,_inset_-5px_-5px_10px_#2c3645] flex items-center justify-center gap-3">
                <i className="fa-solid fa-cart-shopping"></i> মোট {totalBags} ব্যাগ ({totalKg} কেজি) | 💰 {formatMoney(totalTk)} টাকা
            </div>
        </div>
      )}

      <div className="flex justify-end gap-4 mt-6">
        <button onClick={handleSaveHistory} className={`${buttonStyles} w-auto px-6 text-blue-600 dark:text-blue-400 shadow-[5px_5px_10px_#bebebe,_-5px_-5px_10px_#ffffff] active:shadow-[inset_5px_5px_10px_#bebebe,_inset_-5px_-5px_10px_#ffffff] dark:shadow-[5px_5px_10px_#1c222b,_-5px_-5px_10px_#2c3645] dark:active:shadow-[inset_5px_5px_10px_#1c222b,_inset_-5px_-5px_10px_#2c3645] flex items-center gap-2`}>
            <i className="fa-solid fa-floppy-disk"></i> সেভ করুন
        </button>
      </div>

      <div className="mt-10 pt-5 border-t-2 border-dashed border-slate-300 dark:border-gray-600">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-200">
            <i className="fa-solid fa-clock-rotate-left mr-2"></i> সেভ করা হিসাব
          </h2>
          <button 
              onClick={handleExportHistoryPdf} 
              className="py-2 px-4 rounded-xl font-semibold transition-all duration-200 transform active:scale-[0.98] shadow-[5px_5px_10px_#bebebe,_-5px_-5px_10px_#ffffff] active:shadow-[inset_5px_5px_10px_#bebebe,_inset_-5px_-5px_10px_#ffffff] text-purple-600 dark:text-purple-400 dark:shadow-[5px_5px_10px_#1c222b,_-5px_-5px_10px_#2c3645] dark:active:shadow-[inset_5px_5px_10px_#1c222b,_inset_-5px_-5px_10px_#2c3645] text-sm flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
              disabled={history.length === 0}
              aria-label="Export history to PDF"
          >
              <i className="fa-solid fa-file-export"></i> Export PDF
          </button>
        </div>
        <div className="space-y-5">
            {isHistoryLoading ? (
                <p className="text-center text-gray-500 dark:text-gray-400 mt-4">Loading history...</p>
            ) : history.length === 0 ? (
                 <p className="text-center text-gray-500 dark:text-gray-400 mt-4">❌ কোনো কেনাকাটার হিসাব সেভ করা হয়নি।</p>
            ) : (
                history.map((h, index) => (
                    <div key={h.id} className="bg-[#e0e5ec] rounded-xl p-5 shadow-[5px_5px_10px_#bebebe,_-5px_-5px_10px_#ffffff] relative animate-slideInFromBottom dark:bg-gray-800 dark:shadow-[5px_5px_10px_#1c222b,_-5px_-5px_10px_#2c3645]" style={{ animationDelay: `${index * 100}ms`}}>
                        <div className="flex justify-between items-center mb-4 pb-3 border-b-2 border-slate-300 dark:border-gray-600">
                            <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200">{h.shopName}</h3>
                            <span className="text-xs text-gray-500 dark:text-gray-400">🕒 {h.timestamp}</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr>
                                        <th className="p-2 text-center">কোড</th>
                                        <th className="p-2 text-center">নাম</th>
                                        <th className="p-2 text-center">ব্যাগ</th>
                                        <th className="p-2 text-center">কেজি</th>
                                        <th className="p-2 text-center">দাম</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {h.items.map((item, i) => (
                                        <tr key={i} className="border-b border-slate-300/50 dark:border-gray-700">
                                            <td className="p-2 text-center">{item.code}</td>
                                            <td className="p-2 text-center">{item.name}</td>
                                            <td className="p-2 text-center">{item.bags}</td>
                                            <td className="p-2 text-center">{item.kg}</td>
                                            <td className="p-2 text-center">{formatMoney(item.final)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-4 p-3 rounded-lg grid grid-cols-1 sm:grid-cols-3 text-center font-semibold text-slate-600 dark:text-slate-300 gap-2 shadow-[inset_3px_3px_6px_#bebebe,_inset_-3px_-3px_6px_#ffffff] dark:shadow-[inset_3px_3px_6px_#1c222b,_inset_-3px_-3px_6px_#2c3645]">
                            <span>মোট ব্যাগ: {h.totalBags}</span>
                            <span>মোট কেজি: {h.totalKg}</span>
                            <span>মোট টাকা: {formatMoney(h.totalAmount)}</span>
                        </div>
                        <button onClick={() => handleDeleteHistory(h.id)} className="absolute top-4 right-4 text-red-500 dark:text-red-400 w-9 h-9 rounded-full flex items-center justify-center shadow-[3px_3px_6px_#bebebe,_-3px_-3px_6px_#ffffff] active:shadow-[inset_3px_3px_6px_#bebebe,_inset_-3px_-3px_6px_#ffffff] dark:shadow-[3px_3px_6px_#1c222b,_-3px_-3px_6px_#2c3645] dark:active:shadow-[inset_3px_3px_6px_#1c222b,_inset_-3px_-3px_6px_#2c3645] transition-all">
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

export default FeedCalculator;