
import { FeedDataItem, CompanyInfoData, FarmInfoData, NoticeItem } from './types';

export const INITIAL_FEED_DATA: FeedDataItem[] = [
  { code: "701 C", name: "Broiler Starter", price: 3432.50, kg: 50 },
  { code: "702 C", name: "Broiler Grower", price: 3432.50, kg: 50 },
  { code: "702 P", name: "Broiler Grower", price: 3432.50, kg: 50 },
  { code: "703 P", name: "Broiler Finisher", price: 3357.50, kg: 50 },
  { code: "705 P", name: "House Feed", price: 1062.50, kg: 25 },
  { code: "706 C", name: "Sonali Starter", price: 3077.50, kg: 50 },
  { code: "707 P", name: "Sonali Grower", price: 3052.50, kg: 50 },
  { code: "713 C", name: "Sonali Layer Breeder-C", price: 3012.50, kg: 50 },
  { code: "708 C", name: "Cockerel Starter", price: 3317.50, kg: 50 },
  { code: "709 C/P", name: "Cockerel Grower", price: 3292.50, kg: 50 },
  { code: "501 C", name: "Layer Starter", price: 3038.00, kg: 50 },
  { code: "502 C", name: "Layer Grower", price: 2947.50, kg: 50 },
  { code: "502 M", name: "Layer Grower", price: 2947.50, kg: 50 },
  { code: "504 M", name: "Pre Layer", price: 2972.50, kg: 50 },
  { code: "505 M/C", name: "Layer Layer-1", price: 2777.50, kg: 50 },
  { code: "505 P", name: "Layer Layer-1", price: 2792.50, kg: 50 },
  { code: "507 M", name: "Layer Layer-1 (Supreme)", price: 2927.50, kg: 50 },
  { code: "507 P", name: "Layer Layer-1 (Supreme)", price: 2942.50, kg: 50 },
  { code: "506 M/C", name: "Layer Layer-2", price: 2742.50, kg: 50 },
  { code: "506 P", name: "Layer Layer-2", price: 2757.50, kg: 50 },
  { code: "508 M", name: "Layer Layer Concentrate", price: 3325.00, kg: 50 },
  { code: "415 P", name: "Duck Feed", price: 2767.50, kg: 50 },
  { code: "901 P", name: "Beef Fattening-Premium", price: 2248.00, kg: 40 },
  { code: "901 P", name: "Beef Fattening-Premium", price: 1405.00, kg: 25 },
  { code: "901 P", name: "Beef Fattening-Premium", price: 567.00, kg: 10 },
  { code: "901 P", name: "Beef Fattening-Regular", price: 1874.00, kg: 40 },
  { code: "901 P", name: "Beef Fattening-Regular", price: 1171.25, kg: 25 },
  { code: "901 P", name: "Beef Fattening-Regular", price: 473.50, kg: 10 },
  { code: "902 P", name: "Dairy Feed-Premium", price: 2136.00, kg: 40 },
  { code: "902 P", name: "Dairy Feed-Premium", price: 1335.00, kg: 25 },
  { code: "902 P", name: "Dairy Feed-Premium", price: 539.00, kg: 10 },
  { code: "902 P", name: "Dairy Feed-Regular", price: 1862.00, kg: 40 },
  { code: "902 P", name: "Dairy Feed-Regular", price: 1163.75, kg: 25 },
  { code: "902 P", name: "Dairy Feed-Regular", price: 470.50, kg: 10 },
  { code: "910 M", name: "Vushi Mix", price: 1380.00, kg: 30 },
  { code: "911 P", name: "Beef Fattening Sulov", price: 1055.00, kg: 25 },
  { code: "912 P", name: "Dairy Feed Sulov", price: 1065.00, kg: 25 },
  { code: "300 F", name: "Nursery Powder", price: 965.00, kg: 10 },
  { code: "303 F", name: "Pangas Pre-Starter", price: 1770.00, kg: 20 },
  { code: "304 F", name: "Pangas Starter", price: 1530.00, kg: 20 },
  { code: "305 F", name: "Pangas Grower", price: 1440.00, kg: 20 },
  { code: "306 F", name: "Pangas Finisher", price: 1440.00, kg: 20 },
  { code: "313 F", name: "Nursery Powder", price: 1790.00, kg: 20 },
  { code: "314 F", name: "Tilapia Pre-Starter", price: 1590.00, kg: 20 },
  { code: "315 F", name: "Tilapia Grower", price: 1510.00, kg: 20 },
  { code: "320 F", name: "Koi Nursery", price: 965.00, kg: 10 },
  { code: "323 F", name: "Koi Pre-Starter", price: 1810.00, kg: 20 },
  { code: "324 F", name: "Koi Grower", price: 1650.00, kg: 20 },
  { code: "325 F", name: "Koi Grower", price: 1610.00, kg: 20 },
  { code: "330 F", name: "Carp Starter", price: 1330.00, kg: 20 },
  { code: "331 F", name: "Carp Grower", price: 1310.00, kg: 20 },
  { code: "332 F", name: "Carp Finisher", price: 1355.00, kg: 20 },
  { code: "350 F", name: "Floating Nursery-1", price: 1155.00, kg: 10 },
  { code: "301 F", name: "Floating Nursery-2", price: 1155.00, kg: 10 },
  { code: "301 F", name: "Floating Nursery-2", price: 2310.00, kg: 20 },
  { code: "301 M", name: "Pangush Nursery-1", price: 1332.00, kg: 20 },
  { code: "302 C", name: "Pangush Nursery-2", price: 1307.00, kg: 20 },
  { code: "303 P", name: "Pangush Starter", price: 1537.50, kg: 25 },
  { code: "304 P", name: "Pangush Grower", price: 1512.50, kg: 25 },
  { code: "305 P", name: "Pangush Finisher", price: 1487.50, kg: 25 },
  { code: "306 M", name: "Tilapia Nursery-1", price: 1342.00, kg: 20 },
  { code: "307 C", name: "Tilapia Nursery-2", price: 1322.00, kg: 20 },
  { code: "308 P", name: "Tilapia Starter", price: 1575.00, kg: 25 },
  { code: "309 P", name: "Tilapia Grower", price: 1550.00, kg: 25 },
  { code: "310 M", name: "Koi Nursery", price: 1416.00, kg: 20 },
  { code: "311 C", name: "Koi Starter", price: 1326.00, kg: 20 },
  { code: "312 P", name: "Koi Grower", price: 1602.50, kg: 25 },
  { code: "313 P", name: "Carp Starter", price: 1387.50, kg: 25 },
  { code: "314 P", name: "Carp Grower", price: 1375.00, kg: 25 },
  { code: "314 PE", name: "Carp Grower (Eco)", price: 1237.50, kg: 25 },
  { code: "331 FE", name: "Carp Grower", price: 1190.00, kg: 20 }
];

export const INITIAL_NOTICES: NoticeItem[] = [];

export const INITIAL_COMPANY_INFO_DATA: CompanyInfoData = {
  introduction: "AG Agro Industries Ltd., বাংলাদেশের শীর্ষস্থানীয় কৃষিভিত্তিক শিল্প প্রতিষ্ঠানগুলোর মধ্যে অন্যতম। এটি Ahsan Group এর অঙ্গপ্রতিষ্ঠান হিসেবে ১৯৮৬ সালে প্রতিষ্ঠিত হয়। প্রতিষ্ঠানের চেয়ারম্যান হিসেবে দায়িত্ব পালন করছেন এম.ডি. শাহিদুল আহসান।",
  feedMills: [
    { location: "আজুগিচালা, শ্রীপুর, গাজীপুর", capacity: "প্রতি ঘণ্টায় ৩৩ মেট্রিক টন", monthlyProduction: "প্রায় ৩০,০০০ থেকে ৩৩,০০০ মেট্রিক টন" },
    { location: "নোয়াখালী, বেগমগঞ্জ", capacity: "প্রতি ঘণ্টায় ৩৩ মেট্রিক টন", monthlyProduction: "প্রায় ৩০,০০০ থেকে ৩৩,০০০ মেট্রিক টন" }
  ],
  depots: [
    "ঢাকা", "মিরপুর", "গাজীপুর", "নারায়ণগঞ্জ", "ময়মনসিংহ", "চট্টগ্রাম",
    "সিলেট", "বগুড়া", "রংপুর", "রাজশাহী", "খুলনা", "যশোর"
  ],
  products: [
      { title: "ফিড পণ্য", description: "পোল্ট্রি, মাছ ও গবাদি পশুর জন্য উচ্চমানের ফিড।" },
      { title: "ডে-ওল্ড চিকস (DOC)", description: "A1 ব্র্যান্ডের ডে-ওল্ড চিকস সরবরাহ।" },
      { title: "ব্রিডার ফার্ম", description: "বায়োসিকিউরিটি সিস্টেমসহ পরিবেশ নিয়ন্ত্রিত হাউজে হ্যাচিং এগস উৎপাদন।" }
  ],
  management: [
    { title: "চেয়ারম্যান", name: "এম.ডি. শাহিদুল আহসান" },
    { title: "ম্যানেজিং ডিরেক্টর", name: "মিসেস ফারাহ আহসান" },
    { title: "ডিরেক্টর (অপারেশন)", name: "মি. রুশায়েদ আহসান" }
  ],
  ceoNote: "এছাড়াও, কেবিডি মো. লুৎফর রহমান প্রতিষ্ঠানটির প্রধান নির্বাহী কর্মকর্তা (CEO) হিসেবে দায়িত্ব পালন করছেন।",
  socialResponsibility: "AG Agro শুধুমাত্র ব্যবসায়িক সফলতা অর্জন করেনি, বরং সমাজের উন্নয়নে অবদান রেখেছে। প্রতিষ্ঠানটি গ্রামীণ শিক্ষাপ্রতিষ্ঠান, এতিমখানা ও মাদ্রাসা প্রতিষ্ঠায় সহায়তা প্রদান করে। এছাড়াও, দরিদ্র ও সুবিধাবঞ্চিত মানুষের জন্য বিভিন্ন কল্যাণমূলক কার্যক্রম পরিচালনা করে।"
};

export const INITIAL_FARM_INFO_DATA: FarmInfoData = {
  setup: {
    location: [
      "বাজারের কাছাকাছি, কিন্তু শান্ত পরিবেশে।",
      "উঁচু জমিতে (বন্যা/পানি জমে যাবে না)।",
      "রাস্তা দিয়ে গাড়ি আসা-যাওয়া সহজ হবে।",
      "লোকালয়ের একটু দূরে হলে ভালো (দূষণ ও রোগ ছড়ানো কম হবে)।"
    ],
    structure: [
      "বাঁশ, টিন, কাঠ বা কংক্রিট দিয়ে তৈরি করা যায়।",
      "ছাদে টিন/ঢেউটিন/খড় ব্যবহার করা যায় (গরম কমানোর জন্য বাঁশের চাটাইও লাগানো যায়)।",
      "মেঝে উঁচু করতে হবে, সহজে পানি বের হয়ে যাবে এমন ব্যবস্থা।",
      "জানালা ও ভেন্টিলেশন রাখতে হবে যেন বাতাস সহজে চলাচল করে।"
    ],
    space: [
      "ব্রয়লার: প্রতি ১ বর্গফুটে ১টি মুরগি।",
      "লেয়ার: প্রতি ২.৫–৩ বর্গফুটে ১টি মুরগি।",
      "যেমন, ১০০০ ব্রয়লার পালতে হলে ঘর প্রয়োজন হবে কমপক্ষে ১০০০ বর্গফুট।"
    ]
  },
  equipment: [
    "ফিডার (খাবারের বাটি): ৫০টি ব্রয়লারের জন্য ১টি ফিডার, ২৫টি লেয়ারের জন্য ১টি ফিডার।",
    "ড্রিঙ্কার (পানির বাটি): ৫০টি ব্রয়লারের জন্য ১টি ড্রিঙ্কার, ২৫টি লেয়ারের জন্য ১টি ড্রিঙ্কার।",
    "ব্রুডার (ছোট মুরগির জন্য তাপের ব্যবস্থা): ১০০টি বাচ্চার জন্য ১টি ব্রুডার। শীতকালে কয়লা/ইলেকট্রিক বাল্ব/গ্যাস হিটার ব্যবহার করতে হয়।",
    "নেস্ট বক্স (ডিম পাড়ার জন্য): ৫টি লেয়ারের জন্য ১টি নেস্ট বক্স। পরিষ্কার ও শুকনো রাখতে হবে।"
  ],
  broilerCare: {
    title: "ব্রয়লার",
    details: [
      "১–৭ দিন বয়স: প্রতি ৫০টি বাচ্চার জন্য ১টি ছোট ফিডার, ১টি ড্রিঙ্কার। ২৪ ঘণ্টা আলো দিতে হবে। ঘরের তাপমাত্রা রাখতে হবে ৩২–৩৫° সেলসিয়াস।",
      "৮–২১ দিন বয়স: তাপমাত্রা ধীরে ধীরে কমিয়ে ২৮° করতে হবে। দিনে ১৬ ঘণ্টা আলো দিতে হবে। ফিড বাড়াতে হবে বয়স অনুযায়ী।",
      "২২–৩৫ দিন বয়স: দিনে ১৬ ঘণ্টা আলো। প্রতিদিন পর্যাপ্ত পানি দিতে হবে। ৩০–৩৫ দিনে বাজারজাত উপযুক্ত (১.৮–২.২ কেজি)।"
    ]
  },
  layerCare: {
    title: "লেয়ার",
    details: [
      "চিক স্টেজ (০–৮ সপ্তাহ): প্রতি ৫০ বাচ্চার জন্য ১টি ফিডার, ১টি ড্রিঙ্কার। ২৪ ঘণ্টা আলো দিতে হবে। ফিডে প্রোটিন বেশি থাকতে হবে।",
      "গ্রোয়ার স্টেজ (৯–১৮ সপ্তাহ): প্রতিদিন ৪৫–৬০ গ্রাম ফিড। পর্যাপ্ত জায়গা দিতে হবে যাতে মুরগি সুস্থভাবে বড় হয়।",
      "লেয়ার স্টেজ (১৮ সপ্তাহ থেকে ডিম দেওয়া শুরু): প্রতিদিন ১০০–১১০ গ্রাম ফিড। ক্যালসিয়াম ও মিনারেল (ঝিনুকের গুঁড়া, চুন, ভিটামিন) দিতে হবে। দিনে ১৪–১৬ ঘণ্টা আলো দিতে হবে। ১০০টি মুরগি থেকে প্রতিদিন ৭০–৮০টি ডিম পাওয়া যায়।"
    ]
  },
  vaccineSchedule: [
    { id: 'v1', age: "৩–৫ দিন", vaccine: "নিউক্যাসল (ND)", disease: "রানিক্ষেত" },
    { id: 'v2', age: "৭–১০ দিন", vaccine: "গামবোরো", disease: "IBD" },
    { id: 'v3', age: "১৪ দিন", vaccine: "নিউক্যাসল (২য় ডোজ)", disease: "রানিক্ষেত" },
    { id: 'v4', age: "২১ দিন", vaccine: "গামবোরো (২য় ডোজ)", disease: "IBD" },
    { id: 'v5', age: "৩০ দিন", vaccine: "ফাউল পক্স", disease: "গুটি বসন্ত" },
    { id: 'v6', age: "৬ সপ্তাহ", vaccine: "IBD বুস্টার", disease: "রোগ প্রতিরোধ" },
    { id: 'v7', age: "৮ সপ্তাহ (লেয়ার)", vaccine: "লাসোটা", disease: "নিউক্যাসল" },
    { id: 'v8', age: "১৬ সপ্তাহ (লেয়ার)", vaccine: "ফাউল কলেরা", disease: "ব্যাকটেরিয়াল রোগ" }
  ],
  health: [
    "প্রতিদিন পানির বাটি ধুতে হবে।",
    "খাবারের বাটি পরিষ্কার রাখতে হবে।",
    "মৃত মুরগি খামারের বাইরে মাটি চাপা দিতে হবে।",
    "ইঁদুর, বিড়াল, শিয়াল ইত্যাদি যাতে ঢুকতে না পারে সেই ব্যবস্থা করতে হবে।"
  ],
  economics: [
    "ব্রয়লার: ১টি ব্রয়লার ৩৫ দিনে গড়ে ৩.৫–৪ কেজি ফিড খায়। বাজারে বিক্রি হয় ১.৮–২.২ কেজি ওজনে। প্রতি পিসে ৩০–৫০ টাকা লাভ সম্ভব (সঠিক ব্যবস্থাপনায়)।",
    "লেয়ার: ১৮ সপ্তাহ পর্যন্ত খরচ বেশি, কিন্তু ডিম বিক্রি শুরু করলে লাভ আসতে থাকে। একটি লেয়ার বছরে গড়ে ২৬০–২৮০টি ডিম দেয়। ডিম ও পুরনো মুরগি বিক্রি থেকে খামারী ভালো লাভ করতে পারে।"
  ],
  tips: [
    "খামারে ঢোকার আগে হাত-পা ধুতে হবে।",
    "ভিজিটর বেশি ঢুকতে দেওয়া যাবে না।",
    "ফিড হঠাৎ পরিবর্তন করা যাবে না, ধীরে ধীরে পরিবর্তন করতে হবে।",
    "সবসময় ভেটেরিনারি ডাক্তারের সাথে যোগাযোগ রাখতে হবে।"
  ]
};
