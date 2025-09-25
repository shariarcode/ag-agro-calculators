import React, { useState, useRef, useEffect } from 'react';
// FIX: Changed import to full URL to resolve build error on Vercel
import { GoogleGenAI } from 'https://aistudiocdn.com/google-genai@0.0.3';
import Card from '../components/Card';
import { ChatMessage, FarmInfoData } from '../types';

interface AIAssistantProps {
    onBack: () => void;
    farmInfoData: FarmInfoData;
}

// FIX: Reverted to using a hardcoded key as process.env is not available in the browser.
const GEMINI_API_KEY = "AIzaSyAUHuD0rkHaU91OZbiqx_zKkqd0brqn4eU";


// A simple loading indicator component
const LoadingIndicator: React.FC = () => (
    <div className="flex items-center justify-center space-x-1">
        <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
        <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
    </div>
);


const AIAssistant: React.FC<AIAssistantProps> = ({ onBack, farmInfoData }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { sender: 'ai', text: 'আসসালামু আলাইকুম! আমি আপনার AI কৃষি বিশেষজ্ঞ। খামার সংক্রান্ত যেকোনো প্রশ্ন করতে পারেন।' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages, isLoading]);

    const generateSystemInstruction = (data: FarmInfoData): string => {
        let context = `You are a helpful AI assistant for farmers in Bangladesh, named "Krishi Bisesoggo" (Agriculture Expert). Your primary role is to provide advice based on the provided farming information. Always respond in Bengali. The information is as follows:\n\n`;

        context += `Farm Setup: Location should be high, near a market, with good transport. Structure can be bamboo/tin. Space for broilers is 1 sq ft/bird, layers 2.5-3 sq ft/bird.\n`;
        context += `Equipment: 1 feeder and 1 drinker per 50 broilers or 25 layers.\n`;
        context += `Broiler Care: Day 1-7 temp is 32-35°C. Day 8-21 temp reduces to 28°C. Ready for market in 30-35 days.\n`;
        context += `Layer Care: Chicks (0-8 wks), Growers (9-18 wks), Layers (from 18 wks). Layers need 100-110g feed daily and 14-16 hrs of light.\n`;
        
        context += "Vaccine Schedule:\n";
        data.vaccineSchedule.forEach(v => {
            context += `- Age ${v.age}: ${v.vaccine} for ${v.disease}.\n`;
        });
        
        context += `Health Tips: Clean water/feed bowls daily. Keep visitors away. Contact a vet for issues.\n`;
        context += `Economics: A broiler eats 3.5-4 kg of feed in 35 days. A layer produces 260-280 eggs per year.\n`;
        
        context += `\nBased on this information, answer the user's questions concisely and helpfully. If a question is outside this scope, you can use general knowledge but try to relate it back to these principles if possible. If you don't know, say so.`;
        return context;
    };


    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        const userInput = input.trim();
        if (!userInput || isLoading) return;

        const newUserMessage: ChatMessage = { sender: 'user', text: userInput };
        setMessages(prev => [...prev, newUserMessage]);
        setInput('');
        setIsLoading(true);
        setError(null);

        try {
            const apiKey = GEMINI_API_KEY;

            if (!apiKey) {
                throw new Error("API key is missing. Please add the GEMINI_API_KEY in `views/AIAssistant.tsx`.");
            }
            const ai = new GoogleGenAI({ apiKey });
            
            const systemInstruction = generateSystemInstruction(farmInfoData);

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: userInput,
                config: {
                    systemInstruction: systemInstruction,
                }
            });

            const aiResponseText = response.text;
            if (!aiResponseText) {
                throw new Error("Received an empty response from the AI.");
            }
            
            const newAiMessage: ChatMessage = { sender: 'ai', text: aiResponseText.trim() };
            setMessages(prev => [...prev, newAiMessage]);

        } catch (err: any) {
            console.error("Gemini API error:", err);
            const errorMessage = "দুঃখিত, এই মুহূর্তে উত্তর দেওয়া সম্ভব হচ্ছে না। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।";
            setError(errorMessage);
            setMessages(prev => [...prev, { sender: 'ai', text: errorMessage }]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const buttonStyles = "p-3.5 rounded-xl font-bold transition-all duration-200 transform active:scale-[0.98]";

    return (
        <Card>
            <div className="flex flex-col h-[85vh]">
                <div className="flex justify-between items-center mb-4 pb-4 border-b-2 border-slate-300 dark:border-gray-600">
                    <h1 className="text-3xl font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-3">
                        <i className="fa-solid fa-brain text-purple-500"></i> AI কৃষি বিশেষজ্ঞ
                    </h1>
                </div>
                
                <div className="flex-grow overflow-y-auto pr-2 space-y-4 mb-4 bg-[#e0e5ec] dark:bg-gray-800 p-4 rounded-2xl shadow-[inset_5px_5px_10px_#bebebe,_inset_-5px_-5px_10px_#ffffff] dark:shadow-[inset_5px_5px_10px_#1c222b,_inset_-5px_-5px_10px_#2c3645]">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-md lg:max-w-lg p-3 rounded-2xl whitespace-pre-wrap ${
                                msg.sender === 'user' 
                                ? 'bg-blue-200 dark:bg-blue-800 text-slate-800 dark:text-slate-100 rounded-br-none' 
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-bl-none'
                            }`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="max-w-sm p-3 rounded-2xl bg-slate-200 dark:bg-slate-700 rounded-bl-none">
                                <LoadingIndicator />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                
                <form onSubmit={handleSendMessage} className="flex gap-3">
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="এখানে আপনার প্রশ্ন লিখুন..."
                        className="flex-grow p-3 bg-[#e0e5ec] rounded-xl shadow-[inset_5px_5px_10px_#bebebe,_inset_-5px_-5px_10px_#ffffff] focus:shadow-[inset_3px_3px_7px_#bebebe,_inset_-3px_-3px_7px_#ffffff] outline-none transition-shadow duration-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 dark:shadow-[inset_5px_5px_10px_#1c222b,_inset_-5px_-5px_10px_#2c3645] dark:focus:shadow-[inset_3px_3px_7px_#1c222b,_inset_-3px_-3px_7px_#2c3645]"
                        disabled={isLoading}
                    />
                    <button type="submit" disabled={isLoading || !input.trim()} className={`${buttonStyles} w-auto px-5 text-blue-600 dark:text-blue-400 shadow-[5px_5px_10px_#bebebe,_-5px_-5px_10px_#ffffff] active:shadow-[inset_5px_5px_10px_#bebebe,_inset_-5px_-5px_10px_#ffffff] dark:shadow-[5px_5px_10px_#1c222b,_-5px_-5px_10px_#2c3645] dark:active:shadow-[inset_5px_5px_10px_#1c222b,_inset_-5px_-5px_10px_#2c3645] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100`}>
                        <i className="fa-solid fa-paper-plane"></i>
                    </button>
                </form>
            </div>
            <button onClick={onBack} className={`${buttonStyles} w-full mt-4 text-purple-600 dark:text-purple-400 shadow-[5px_5px_10px_#bebebe,_-5px_-5px_10px_#ffffff] active:shadow-[inset_5px_5px_10px_#bebebe,_inset_-5px_-5px_10px_#ffffff] dark:shadow-[5px_5px_10px_#1c222b,_-5px_-5px_10px_#2c3645] dark:active:shadow-[inset_5px_5px_10px_#1c222b,_inset_-5px_-5px_10px_#2c3645] flex items-center justify-center gap-2`}>
                <i className="fa-solid fa-arrow-left"></i> মেনুতে ফিরে যান
            </button>
        </Card>
    );
};

export default AIAssistant;