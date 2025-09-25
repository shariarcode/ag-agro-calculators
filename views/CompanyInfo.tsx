
import React from 'react';
import Card from '../components/Card';
import { CompanyInfoData } from '../types';

interface CompanyInfoProps {
  onBack: () => void;
  data: CompanyInfoData;
}

const InfoSection: React.FC<{ title: string; icon: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ title, icon, children, style }) => (
    <div className="mb-6" style={style}>
        <h3 className="text-xl font-bold text-slate-600 dark:text-slate-300 mb-2 flex items-center gap-2">
            <i className={icon}></i> {title}
        </h3>
        <div className="pl-4 border-l-2 border-slate-300 dark:border-gray-600">
            {children}
        </div>
    </div>
);

const CompanyInfo: React.FC<CompanyInfoProps> = ({ onBack, data }) => {
  const buttonStyles = "w-full p-3.5 rounded-xl font-bold transition-all duration-200 transform active:scale-[0.98]";

  return (
    <Card>
        <h1 className="text-3xl font-bold text-center mb-6 text-slate-700 dark:text-slate-200 flex items-center justify-center gap-3">
            <i className="fa-solid fa-building"></i> কোম্পানির পরিচিতি
        </h1>

        <div className="text-base text-gray-700 dark:text-gray-300 leading-relaxed stagger-animation">
            {/* FIX: Merged duplicate 'style' attributes into one. */}
            <h2 style={{'--stagger-index': 0} as React.CSSProperties} className="text-2xl font-bold text-slate-700 dark:text-slate-200 mb-4 pb-2 border-b-2 border-slate-300 dark:border-gray-600">🏢 এজি এগ্রো ইন্ডাস্ট্রিজ লিমিটেড (AG Agro Industries Ltd.) পরিচিতি</h2>
            <p style={{'--stagger-index': 1} as React.CSSProperties} className="mb-6">{data.introduction}</p>

            <InfoSection style={{'--stagger-index': 2} as React.CSSProperties} title="ফিড মিলের অবস্থান ও উৎপাদন ক্ষমতা" icon="fa-solid fa-industry">
                <p>AG Agro-এর {data.feedMills.length}টি অত্যাধুনিক ফিড মিল রয়েছে:</p>
                <ol className="list-decimal list-inside mt-2 space-y-2">
                    {data.feedMills.map((mill, index) => (
                        <li key={index}>{mill.location}
                            <ul className="list-disc list-inside ml-4">
                                <li>উৎপাদন ক্ষমতা: {mill.capacity}</li>
                                <li>মাসিক উৎপাদন: {mill.monthlyProduction}</li>
                            </ul>
                        </li>
                    ))}
                </ol>
            </InfoSection>

            <InfoSection style={{'--stagger-index': 3} as React.CSSProperties} title="ডিপো বা বিক্রয় কেন্দ্র" icon="fa-solid fa-store">
                <p>
                  AG Agro তাদের উৎপাদিত পণ্য সরাসরি কৃষকদের কাছে পৌঁছে দেওয়ার জন্য সারা বাংলাদেশে {data.depots.length}টির বেশি বিক্রয় কেন্দ্র বা ডিপো স্থাপন করেছে। এই ডিপোগুলো দেশের বিভিন্ন গুরুত্বপূর্ণ স্থানে ছড়িয়ে আছে, যেমন:
                </p>
                <ul className="list-disc list-inside mt-2 grid grid-cols-2 sm:grid-cols-3 gap-1">
                    {data.depots.map((depot, index) => <li key={index}>{depot}</li>)}
                </ul>
            </InfoSection>

            <InfoSection style={{'--stagger-index': 4} as React.CSSProperties} title="পণ্য ও সেবা" icon="fa-solid fa-box-open">
                <ul className="list-disc list-inside space-y-1">
                    {data.products.map((product, index) => (
                       <li key={index}><strong>{product.title}:</strong> {product.description}</li>
                    ))}
                </ul>
            </InfoSection>
            
            <InfoSection style={{'--stagger-index': 5} as React.CSSProperties} title="ব্যবস্থাপনা ও নেতৃত্ব" icon="fa-solid fa-users">
                <ul className="list-disc list-inside space-y-1">
                    {data.management.map((member, index) => (
                        <li key={index}><strong>{member.title}:</strong> {member.name}</li>
                    ))}
                </ul>
                <p className="mt-2">{data.ceoNote}</p>
            </InfoSection>

            <InfoSection style={{'--stagger-index': 6} as React.CSSProperties} title="সামাজিক দায়বদ্ধতা" icon="fa-solid fa-hand-holding-heart">
                <p>{data.socialResponsibility}</p>
            </InfoSection>
        </div>

        <button onClick={onBack} className={`${buttonStyles} mt-8 text-purple-600 dark:text-purple-400 shadow-[5px_5px_10px_#bebebe,_-5px_-5px_10px_#ffffff] active:shadow-[inset_5px_5px_10px_#bebebe,_inset_-5px_-5px_10px_#ffffff] dark:shadow-[5px_5px_10px_#1c222b,_-5px_-5px_10px_#2c3645] dark:active:shadow-[inset_5px_5px_10px_#1c222b,_inset_-5px_-5px_10px_#2c3645] flex items-center justify-center gap-2`}>
            <i className="fa-solid fa-arrow-left"></i> মেনুতে ফিরে যান
        </button>
    </Card>
  );
};

export default CompanyInfo;