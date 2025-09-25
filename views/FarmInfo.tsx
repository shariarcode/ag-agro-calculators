import React from 'react';
import Card from '../components/Card';
import { FarmInfoData } from '../types';

interface FarmInfoProps { 
    onBack: () => void;
    data: FarmInfoData;
}

const InfoBlock: React.FC<{title: string, children: React.ReactNode, style?: React.CSSProperties}> = ({ title, children, style }) => (
    <div className="mb-6" style={style}>
        <h3 className="text-xl font-bold text-slate-600 dark:text-slate-300 mb-2 pb-1 border-b border-slate-300 dark:border-gray-600">{title}</h3>
        <div className="space-y-3">
            {children}
        </div>
    </div>
);

const FarmInfo: React.FC<FarmInfoProps> = ({ onBack, data }) => {
  const buttonStyles = "w-full p-3.5 rounded-xl font-bold transition-all duration-200 transform active:scale-[0.98]";
  
  return (
    <Card>
      <h1 className="text-3xl font-bold text-center mb-6 text-slate-700 dark:text-slate-200 flex items-center justify-center gap-3">
        <i className="fa-solid fa-seedling"></i> খামারের তথ্য
      </h1>
      
      <div className="text-base text-gray-700 dark:text-gray-300 leading-relaxed stagger-animation">
        <h2 style={{ '--stagger-index': 0 } as React.CSSProperties} className="text-2xl font-bold text-slate-700 dark:text-slate-200 mb-4 pb-2 border-b-2 border-slate-300 dark:border-gray-600">🐔 ব্রয়লার ও লেয়ার মুরগি পালনের বিস্তারিত গাইডলাইন</h2>
        
        <InfoBlock style={{ '--stagger-index': 1 } as React.CSSProperties} title="১. খামার স্থাপনের নিয়ম">
            <h4 className="font-semibold text-lg">স্থান নির্বাচন</h4>
            <ul className="list-disc list-inside">{data.setup.location.map((item, i) => <li key={i}>{item}</li>)}</ul>
            <h4 className="font-semibold text-lg mt-4">ঘরের কাঠামো</h4>
            <ul className="list-disc list-inside">{data.setup.structure.map((item, i) => <li key={i}>{item}</li>)}</ul>
            <h4 className="font-semibold text-lg mt-4">জায়গার হিসাব</h4>
            <ul className="list-disc list-inside">{data.setup.space.map((item, i) => <li key={i}>{item}</li>)}</ul>
        </InfoBlock>

        <InfoBlock style={{ '--stagger-index': 2 } as React.CSSProperties} title="২. প্রয়োজনীয় সরঞ্জাম">
             <ul className="list-disc list-inside">{data.equipment.map((item, i) => <li key={i}>{item}</li>)}</ul>
        </InfoBlock>
        
        <InfoBlock style={{ '--stagger-index': 3 } as React.CSSProperties} title="৩. মুরগির বয়সভিত্তিক যত্ন">
            <h4 className="font-semibold text-lg text-green-700 dark:text-green-400">🟢 {data.broilerCare.title}</h4>
            <ol className="list-decimal list-inside ml-4 space-y-1">{data.broilerCare.details.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: item.replace(/(^.+?:)/, '<strong>$1</strong>') }}></li>)}</ol>
            <h4 className="font-semibold text-lg mt-4 text-yellow-700 dark:text-yellow-400">🟡 {data.layerCare.title}</h4>
            <ol className="list-decimal list-inside ml-4 space-y-1">{data.layerCare.details.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: item.replace(/(^.+?:)/, '<strong>$1</strong>') }}></li>)}</ol>
        </InfoBlock>

        <InfoBlock style={{ '--stagger-index': 4 } as React.CSSProperties} title="৪. টিকা প্রোগ্রাম">
            <div className="overflow-x-auto rounded-xl shadow-[inset_5px_5px_10px_#bebebe,_inset_-5px_-5px_10px_#ffffff] dark:shadow-[inset_5px_5px_10px_#1c222b,_inset_-5px_-5px_10px_#2c3645] p-2">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b-2 border-slate-300 dark:border-gray-600">
                            <th className="p-2 font-bold text-slate-600 dark:text-slate-300">বয়স</th>
                            <th className="p-2 font-bold text-slate-600 dark:text-slate-300">ভ্যাকসিন</th>
                            <th className="p-2 font-bold text-slate-600 dark:text-slate-300">রোগ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.vaccineSchedule.map(v => (
                            <tr key={v.id} className="border-b border-slate-300/70 dark:border-gray-700">
                                <td className="p-2">{v.age}</td>
                                <td className="p-2">{v.vaccine}</td>
                                <td className="p-2">{v.disease}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </InfoBlock>
        
        <InfoBlock style={{ '--stagger-index': 5 } as React.CSSProperties} title="৫. পরিচ্ছন্নতা ও স্বাস্থ্য">
            <ul className="list-disc list-inside">{data.health.map((item, i) => <li key={i}>{item}</li>)}</ul>
        </InfoBlock>
        
        <InfoBlock style={{ '--stagger-index': 6 } as React.CSSProperties} title="৬. খরচ ও লাভের হিসাব (সংক্ষিপ্ত)">
            <ul className="list-disc list-inside">{data.economics.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: item.replace(/(\w+:)/, '<strong>$1</strong>') }}></li>)}</ul>
        </InfoBlock>

        <InfoBlock style={{ '--stagger-index': 7 } as React.CSSProperties} title="৭. বাড়তি টিপস">
            <ul className="list-disc list-inside">{data.tips.map((item, i) => <li key={i}>{item}</li>)}</ul>
        </InfoBlock>

      </div>

      <button onClick={onBack} className={`${buttonStyles} mt-8 text-purple-600 dark:text-purple-400 shadow-[5px_5px_10px_#bebebe,_-5px_-5px_10px_#ffffff] active:shadow-[inset_5px_5px_10px_#bebebe,_inset_-5px_-5px_10px_#ffffff] dark:shadow-[5px_5px_10px_#1c222b,_-5px_-5px_10px_#2c3645] dark:active:shadow-[inset_5px_5px_10px_#1c222b,_inset_-5px_-5px_10px_#2c3645] flex items-center justify-center gap-2`}>
        <i className="fa-solid fa-arrow-left"></i> মেনুতে ফিরে যান
      </button>
    </Card>
  );
};

export default FarmInfo;