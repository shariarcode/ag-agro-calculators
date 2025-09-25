
import React, { useState, useEffect, useRef, useMemo } from 'https://aistudiocdn.com/react@^19.1.1';
import Card from '../components/Card';
import { supabase } from '../lib/supabaseClient';
import { FeedDataItem, CompanyInfoData, FarmInfoData, FeedMill, ManagementMember, ProductService, VaccineInfo, NoticeItem } from '../types';
import InputGroup from '../components/InputGroup';

// Make TypeScript aware of the global objects from the CDN scripts
declare var jspdf: any;


interface AdminPanelProps {
  onLogout: () => void;
  feedList: FeedDataItem[];
  setFeedList: React.Dispatch<React.SetStateAction<FeedDataItem[]>>;
  companyInfo: CompanyInfoData | null;
  setCompanyInfo: React.Dispatch<React.SetStateAction<CompanyInfoData | null>>;
  farmInfo: FarmInfoData | null;
  setFarmInfo: React.Dispatch<React.SetStateAction<FarmInfoData | null>>;
  notices: NoticeItem[];
  setNotices: React.Dispatch<React.SetStateAction<NoticeItem[]>>;
}

type AdminTab = 'feeds' | 'company' | 'farm' | 'notices';
type SortableFeedKeys = 'code' | 'name' | 'price';

const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout, feedList, setFeedList, companyInfo, setCompanyInfo, farmInfo, setFarmInfo, notices, setNotices }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('feeds');
  
  // State for Feed Management
  const [isFeedModalOpen, setFeedModalOpen] = useState(false);
  const [editingFeed, setEditingFeed] = useState<FeedDataItem | null>(null);
  const [feedForm, setFeedForm] = useState<FeedDataItem>({ code: '', name: '', price: 0, kg: 0 });
  const [feedSearchQuery, setFeedSearchQuery] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: SortableFeedKeys; direction: 'ascending' | 'descending' }>({ key: 'code', direction: 'ascending' });
  const pdfImportRef = useRef<HTMLInputElement>(null);
  const [pdfPreviewData, setPdfPreviewData] = useState<FeedDataItem[]>([]);
  const [isPdfPreviewModalOpen, setPdfPreviewModalOpen] = useState(false);

  // State for Notice Management
  const [isNoticeModalOpen, setNoticeModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<NoticeItem | null>(null);
  const [noticeForm, setNoticeForm] = useState<Omit<NoticeItem, 'id' | 'date'>>({ title: '', content: '', isActive: true });
  const [noticeFilter, setNoticeFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [noticeSortConfig, setNoticeSortConfig] = useState<{ key: 'date'; direction: 'ascending' | 'descending' }>({ key: 'date', direction: 'descending' });


  // State for Info Page Management
  const [companyInfoDraft, setCompanyInfoDraft] = useState(companyInfo);
  const [farmInfoDraft, setFarmInfoDraft] = useState(farmInfo);
  
  const handleCompanyInfoChange = <K extends keyof CompanyInfoData>(field: K, value: CompanyInfoData[K]) => {
    setCompanyInfoDraft(prev => (prev ? { ...prev, [field]: value } : null));
  };

  const handleFarmInfoChange = <K extends keyof FarmInfoData>(field: K, value: FarmInfoData[K]) => {
    setFarmInfoDraft(prev => (prev ? { ...prev, [field]: value } : null));
  };

  useEffect(() => {
    if (editingFeed) setFeedForm(editingFeed);
    else setFeedForm({ code: '', name: '', price: 0, kg: 0 });
  }, [editingFeed]);
  
  useEffect(() => {
    if (editingNotice) {
      setNoticeForm({
        title: editingNotice.title,
        content: editingNotice.content,
        isActive: editingNotice.isActive,
      });
    } else {
      setNoticeForm({ title: '', content: '', isActive: true });
    }
  }, [editingNotice]);

  const openAddFeedModal = () => { setEditingFeed(null); setFeedModalOpen(true); };
  const openEditFeedModal = (feed: FeedDataItem) => { setEditingFeed(feed); setFeedModalOpen(true); };

  const handleFeedFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFeedForm(prev => ({ ...prev, [name]: name === 'price' || name === 'kg' ? parseFloat(value) : value }));
  };
  
  const handleFeedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { code, name, price, kg } = feedForm;

    // Validation
    if (!code.trim() || !name.trim() || isNaN(price) || price <= 0 || isNaN(kg) || kg <= 0) {
      alert('Please fill all fields with valid data.');
      return;
    }
    if (!editingFeed && feedList.some(f => f.code.trim().toLowerCase() === code.trim().toLowerCase())) {
      alert('A feed with this code already exists.');
      return;
    }

    const processedFeed = { ...feedForm, code: code.trim(), name: name.trim() };
    
    if (editingFeed) {
        const { data, error } = await supabase.from('feed_list').update(processedFeed).match({ code: editingFeed.code }).select().single();
        if (error) { alert('Failed to update feed: ' + error.message); } 
        else { setFeedList(feedList.map(f => (f.code === editingFeed.code ? data : f))); }
    } else {
        const { data, error } = await supabase.from('feed_list').insert(processedFeed).select().single();
        if (error) { alert('Failed to add feed: ' + error.message); }
        else { setFeedList([...feedList, data]); }
    }
    setFeedModalOpen(false);
  };
  
  const handleDeleteFeed = async (code: string) => {
    if (window.confirm(`Are you sure you want to delete feed with code ${code}?`)) {
        const { error } = await supabase.from('feed_list').delete().match({ code });
        if (error) { alert('Failed to delete feed: ' + error.message); }
        else { setFeedList(feedList.filter(f => f.code !== code)); }
    }
  };

  const openAddNoticeModal = () => { setEditingNotice(null); setNoticeModalOpen(true); };
  const openEditNoticeModal = (notice: NoticeItem) => { setEditingNotice(notice); setNoticeModalOpen(true); };
  
  const handleNoticeFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNoticeForm(prev => ({ ...prev, [name]: value }));
  };

  const handleNoticeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeForm.title.trim() || !noticeForm.content.trim()) {
      alert('Title and Content cannot be empty.');
      return;
    }

    if (editingNotice) {
      const noticeToUpdate = { ...noticeForm, date: new Date().toISOString() };
      const { data, error } = await supabase.from('notices').update(noticeToUpdate).match({ id: editingNotice.id }).select().single();
      if (error) { alert('Failed to update notice: ' + error.message); }
      else { setNotices(notices.map(n => n.id === editingNotice.id ? {...data, date: new Date(data.date).toLocaleString('en-US')} : n)); }
    } else {
      const noticeToInsert = { ...noticeForm, date: new Date().toISOString() };
      const { data, error } = await supabase.from('notices').insert(noticeToInsert).select().single();
      if (error) { alert('Failed to add notice: ' + error.message); }
      else { setNotices([{...data, date: new Date(data.date).toLocaleString('en-US')}, ...notices]); }
    }
    setNoticeModalOpen(false);
  };

  const handleDeleteNotice = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this notice?')) {
        const { error } = await supabase.from('notices').delete().match({ id });
        if (error) { alert('Failed to delete notice: ' + error.message); }
        else { setNotices(notices.filter(n => n.id !== id)); }
    }
  };


  const saveCompanyInfo = async () => {
      const { error } = await supabase.from('company_info').update({ data: companyInfoDraft }).match({ id: 1 });
      if (error) { alert('Failed to update company info: ' + error.message); }
      else { setCompanyInfo(companyInfoDraft); alert('Company Info updated!'); }
  };
  const saveFarmInfo = async () => {
      const { error } = await supabase.from('farm_info').update({ data: farmInfoDraft }).match({ id: 1 });
      if (error) { alert('Failed to update farm info: ' + error.message); }
      else { setFarmInfo(farmInfoDraft); alert('Farm Info updated!'); }
  };

  const handleExportPdf = () => {
    try {
        const { jsPDF } = jspdf;
        const doc = new jsPDF();
        
        doc.setFont('helvetica', 'bold');
        doc.text("AG Agro Feed List", 14, 16);
        doc.setFont('helvetica', 'normal');

        doc.autoTable({
            head: [['Code', 'Name', 'Price', 'KG', 'Price per KG']],
            body: sortedAndFilteredFeedList.map(f => [
                f.code, 
                f.name, 
                f.price.toFixed(2), 
                f.kg,
                f.kg ? (f.price / f.kg).toFixed(2) : 'N/A'
            ]),
            startY: 20,
            theme: 'grid',
            headStyles: { fillColor: [85, 85, 85] },
        });

        doc.save('ag-agro-feed-list.pdf');
    } catch (e) {
        alert('Could not export PDF. Check console for errors.');
        console.error(e);
    }
  };

  const handlePdfImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      try {
          // Dynamically import pdf.js from CDN
          const pdfjsModule = await import(/* @vite-ignore */ 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.min.mjs');
          const pdfjsLib = pdfjsModule.default;
          pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs`;

          const arrayBuffer = await file.arrayBuffer();
          const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
          
          let newFeeds: FeedDataItem[] = [];
          
          for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const textContent = await page.getTextContent();
              
              const lines = textContent.items.reduce((acc: { [key: number]: string }, item: any) => {
                  const y = Math.round(item.transform[5]);
                  acc[y] = (acc[y] || '') + item.str;
                  return acc;
              }, {});

              for (const line of Object.values(lines)) {
                  const parts = (line as string).trim().split(/\s{2,}/);
                  if (parts.length === 4) {
                      const [code, name, priceStr, kgStr] = parts;
                      const price = parseFloat(priceStr);
                      const kg = parseInt(kgStr);

                      if (code && name && !isNaN(price) && !isNaN(kg)) {
                          newFeeds.push({ code: code.trim(), name: name.trim(), price, kg });
                      }
                  }
              }
          }

          if (newFeeds.length > 0) {
              setPdfPreviewData(newFeeds);
              setPdfPreviewModalOpen(true);
          } else {
              alert('No valid feed data found in the PDF. Please ensure the PDF has 4 columns: Code, Name, Price, KG, separated by at least two spaces.');
          }

      } catch (error) {
          console.error('Error importing PDF:', error);
          alert('Failed to import PDF. See console for details.');
      } finally {
          if (event.target) event.target.value = '';
      }
  };
  
  const handleConfirmPdfImport = async () => {
    if (pdfPreviewData.length === 0) return;

    const { error } = await supabase.from('feed_list').upsert(pdfPreviewData, { onConflict: 'code' });
    
    if (error) {
        alert('Failed to import feeds: ' + error.message);
    } else {
        const feedMap = new Map(feedList.map(f => [f.code, f]));
        pdfPreviewData.forEach(nf => feedMap.set(nf.code, nf));
        setFeedList(Array.from(feedMap.values()).sort((a: FeedDataItem, b: FeedDataItem) => a.code.localeCompare(b.code)));
        alert(`Successfully imported/updated ${pdfPreviewData.length} feeds.`);
    }
    
    setPdfPreviewModalOpen(false);
    setPdfPreviewData([]);
  };

  const neoButton = "py-2 px-4 rounded-xl font-semibold transition-all duration-200 transform active:scale-[0.98] shadow-[5px_5px_10px_#bebebe,_-5px_-5px_10px_#ffffff] active:shadow-[inset_5px_5px_10px_#bebebe,_inset_-5px_-5px_10px_#ffffff] dark:shadow-[5px_5px_10px_#1c222b,_-5px_-5px_10px_#2c3645] dark:active:shadow-[inset_5px_5px_10px_#1c222b,_inset_-5px_-5px_10px_#2c3645]";
  const neoInput = "p-2 bg-[#e0e5ec] rounded-xl shadow-[inset_3px_3px_6px_#bebebe,_inset_-3px_-3px_6px_#ffffff] focus:shadow-[inset_2px_2px_4px_#bebebe,_inset_-2px_-2px_4px_#ffffff] outline-none transition-shadow duration-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 dark:shadow-[inset_3px_3px_6px_#1c222b,_inset_-3px_-3px_6px_#2c3645] dark:focus:shadow-[inset_2px_2px_4px_#1c222b,_inset_-2px_-2px_4px_#2c3645]";

  const TabButton: React.FC<{tab: AdminTab, label: string, icon: string}> = ({ tab, label, icon }) => (
    <button onClick={() => setActiveTab(tab)} className={`flex-1 p-3 text-sm font-bold rounded-t-lg transition-all flex items-center justify-center gap-2 ${activeTab === tab ? 'text-blue-600 dark:text-blue-400 shadow-[inset_5px_5px_10px_#bebebe,_inset_-5px_-5px_10px_#ffffff] dark:shadow-[inset_5px_5px_10px_#1c222b,_inset_-5px_-5px_10px_#2c3645]' : 'text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200'}`}>
        <i className={icon}></i> {label}
    </button>
  );

  const StringListEditor: React.FC<{title: string, list: string[], setList: (list: string[])=>void}> = ({title, list, setList}) => {
      const [newItem, setNewItem] = useState('');
      const handleAdd = () => {
          if(newItem.trim()) { setList([...list, newItem.trim()]); setNewItem(''); }
      };
      const handleRemove = (index: number) => setList(list.filter((_, i) => i !== index));

      return (
          <div className="p-3 my-2 rounded-md shadow-[inset_5px_5px_10px_#bebebe,_inset_-5px_-5px_10px_#ffffff] dark:shadow-[inset_5px_5px_10px_#1c222b,_inset_-5px_-5px_10px_#2c3645]">
              <h3 className="font-bold mb-2 text-slate-600 dark:text-slate-300">{title}</h3>
              <ul className="space-y-1 mb-2">
                  {list.map((item, index) => (
                      <li key={index} className="flex justify-between items-center bg-[#e0e5ec] dark:bg-gray-700/50 p-1 rounded">
                          <span>{item}</span>
                          <button onClick={() => handleRemove(index)} className="text-red-500 dark:text-red-400 text-xs font-bold">Remove</button>
                      </li>
                  ))}
              </ul>
              <div className="flex gap-2">
                  <input value={newItem} onChange={e => setNewItem(e.target.value)} className={`flex-grow ${neoInput}`}/>
                  <button onClick={handleAdd} className={`${neoButton} text-blue-500 dark:text-blue-400 text-sm`}>Add</button>
              </div>
          </div>
      )
  };

  const requestSort = (key: SortableFeedKeys) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const sortedAndFilteredFeedList = useMemo(() => {
    const filteredFeedList = feedList.filter(feed => {
      const searchMatch = feed.code.toLowerCase().includes(feedSearchQuery.toLowerCase()) ||
                          feed.name.toLowerCase().includes(feedSearchQuery.toLowerCase());
  
      const minPriceNum = parseFloat(minPrice);
      const maxPriceNum = parseFloat(maxPrice);
  
      const minPriceMatch = isNaN(minPriceNum) || feed.price >= minPriceNum;
      const maxPriceMatch = isNaN(maxPriceNum) || feed.price <= maxPriceNum;
      
      return searchMatch && minPriceMatch && maxPriceMatch;
    });

    const sortableItems = [...filteredFeedList];
    if (sortConfig.key) {
        sortableItems.sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];
            
            let comparison = 0;
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                comparison = aValue.localeCompare(bValue);
            } else if (typeof aValue === 'number' && typeof bValue === 'number') {
                comparison = aValue - bValue;
            }
            
            return sortConfig.direction === 'ascending' ? comparison : -comparison;
        });
    }
    return sortableItems;
  }, [feedList, feedSearchQuery, minPrice, maxPrice, sortConfig]);
  
  const requestNoticeSort = (key: 'date') => {
    let direction: 'ascending' | 'descending' = 'descending';
    if (noticeSortConfig.key === key && noticeSortConfig.direction === 'descending') {
      direction = 'ascending';
    }
    setNoticeSortConfig({ key, direction });
  };
  
  const filteredAndSortedNotices = useMemo(() => {
    let filtered = notices;

    if (noticeFilter !== 'all') {
      filtered = notices.filter(n => n.isActive === (noticeFilter === 'active'));
    }

    const sorted = [...filtered].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      const comparison = dateA - dateB;

      if (noticeSortConfig.direction === 'ascending') {
        return comparison;
      }
      return -comparison;
    });

    return sorted;
  }, [notices, noticeFilter, noticeSortConfig]);

  if (!companyInfo || !farmInfo) {
      return <div>Loading editor...</div>;
  }

  return (
    <Card>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-700 dark:text-slate-200"><i className="fa-solid fa-user-shield mr-2"></i> Admin Panel</h1>
        <button onClick={onLogout} className={`${neoButton} text-red-500 dark:text-red-400 flex items-center gap-2`}><i className="fa-solid fa-right-from-bracket"></i> Logout</button>
      </div>

      <div className="flex">
        <TabButton tab="feeds" label="Feed Management" icon="fa-solid fa-wheat-awn"/>
        <TabButton tab="company" label="Company Info" icon="fa-solid fa-building"/>
        <TabButton tab="farm" label="Farm Info" icon="fa-solid fa-seedling"/>
        <TabButton tab="notices" label="Notice Management" icon="fa-solid fa-bullhorn"/>
      </div>

      <div className="p-4 rounded-b-lg shadow-[inset_5px_5px_10px_#bebebe,_inset_-5px_-5px_10px_#ffffff] dark:shadow-[inset_5px_5px_10px_#1c222b,_inset_-5px_-5px_10px_#2c3645]">
        {activeTab === 'feeds' && (
          <div>
            <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
              <div className="flex gap-2 flex-wrap">
                  <button onClick={openAddFeedModal} className={`${neoButton} text-green-600 dark:text-green-400`}><i className="fa-solid fa-plus mr-2"></i>Add New Feed</button>
                  <button onClick={() => pdfImportRef.current?.click()} className={`${neoButton} text-blue-600 dark:text-blue-400`}><i className="fa-solid fa-file-import mr-2"></i>Import PDF</button>
                  <input type="file" ref={pdfImportRef} onChange={handlePdfImport} accept=".pdf" className="hidden" aria-label="Import PDF file" />
                  <button onClick={handleExportPdf} className={`${neoButton} text-purple-600 dark:text-purple-400`}><i className="fa-solid fa-file-export mr-2"></i>Export PDF</button>
              </div>
              <div className="flex items-center gap-2 flex-wrap justify-end flex-grow">
                  <div className="relative">
                      <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                      <input
                          type="text"
                          placeholder="Search..."
                          value={feedSearchQuery}
                          onChange={(e) => setFeedSearchQuery(e.target.value)}
                          className={`${neoInput} pl-10 w-full sm:w-48`}
                          aria-label="Search by code or name"
                      />
                  </div>
                  <input
                      type="number"
                      placeholder="Min Price"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className={`${neoInput} w-28`}
                      aria-label="Minimum Price"
                  />
                  <input
                      type="number"
                      placeholder="Max Price"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className={`${neoInput} w-28`}
                      aria-label="Maximum Price"
                  />
              </div>
            </div>
            <div className="overflow-x-auto rounded-xl shadow-[inset_5px_5px_10px_#bebebe,_inset_-5px_-5px_10px_#ffffff] dark:shadow-[inset_5px_5px_10px_#1c222b,_inset_-5px_-5px_10px_#2c3645] p-2"><table className="w-full">
              <thead>
                <tr className="border-b-2 border-slate-300 dark:border-gray-600">
                  <th className="p-3 text-left">
                      <button onClick={() => requestSort('code')} className="font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 flex items-center gap-1.5 transition-colors">
                          Code
                          {sortConfig.key === 'code' && <span className="text-xs">{sortConfig.direction === 'ascending' ? '▲' : '▼'}</span>}
                      </button>
                  </th>
                  <th className="p-3 text-left">
                      <button onClick={() => requestSort('name')} className="font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 flex items-center gap-1.5 transition-colors">
                          Name
                          {sortConfig.key === 'name' && <span className="text-xs">{sortConfig.direction === 'ascending' ? '▲' : '▼'}</span>}
                      </button>
                  </th>
                  <th className="p-3 text-left">
                      <button onClick={() => requestSort('price')} className="font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 flex items-center gap-1.5 transition-colors">
                          Price
                          {sortConfig.key === 'price' && <span className="text-xs">{sortConfig.direction === 'ascending' ? '▲' : '▼'}</span>}
                      </button>
                  </th>
                  <th className="p-3 text-left font-bold text-slate-600 dark:text-slate-300">KG</th>
                  <th className="p-3 text-left font-bold text-slate-600 dark:text-slate-300">Price per KG</th>
                  <th className="p-3 text-center font-bold text-slate-600 dark:text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody>{sortedAndFilteredFeedList.map((feed, index) => (<tr key={feed.code} className="border-b border-slate-300/70 dark:border-gray-700 animate-slideInFromBottom" style={{ animationDelay: `${index * 30}ms`}}><td className="p-3">{feed.code}</td><td className="p-3">{feed.name}</td><td className="p-3">{feed.price.toFixed(2)}</td><td className="p-3">{feed.kg}</td><td className="p-3">{(feed.price / feed.kg).toFixed(2)}</td><td className="p-3 text-center space-x-2"><button onClick={() => openEditFeedModal(feed)} className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">Edit</button><button onClick={() => handleDeleteFeed(feed.code)} className="font-semibold text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300">Delete</button></td></tr>))}</tbody>
            </table></div>
          </div>
        )}

        {activeTab === 'company' && (
          <div>
            <h2 className="text-xl font-bold mb-2 text-slate-700 dark:text-slate-200">Edit Company Info</h2>
            <InputGroup label="Introduction"><textarea value={companyInfoDraft.introduction} onChange={(e) => handleCompanyInfoChange('introduction', e.target.value)} className={`w-full h-24 text-sm ${neoInput}`}></textarea></InputGroup>
            
            <StringListEditor title="Depots" list={companyInfoDraft.depots} setList={(newList) => handleCompanyInfoChange('depots', newList)} />

             <InputGroup label="CEO Note"><input type="text" value={companyInfoDraft.ceoNote} onChange={(e) => handleCompanyInfoChange('ceoNote', e.target.value)} className={`w-full text-sm ${neoInput}`} /></InputGroup>
             <InputGroup label="Social Responsibility"><textarea value={companyInfoDraft.socialResponsibility} onChange={(e) => handleCompanyInfoChange('socialResponsibility', e.target.value)} className={`w-full h-24 text-sm ${neoInput}`}></textarea></InputGroup>

            <button onClick={saveCompanyInfo} className={`mt-4 w-full ${neoButton} text-blue-600 dark:text-blue-400`}>Save Company Info</button>
          </div>
        )}

        {activeTab === 'farm' && (
            <div>
                 <h2 className="text-xl font-bold mb-2 text-slate-700 dark:text-slate-200">Edit Farm Info</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <StringListEditor title="Setup: Location" list={farmInfoDraft.setup.location} setList={(newList) => setFarmInfoDraft(p => (p ? {...p, setup: {...p.setup, location: newList}} : null))} />
                    <StringListEditor title="Setup: Structure" list={farmInfoDraft.setup.structure} setList={(newList) => setFarmInfoDraft(p => (p ? {...p, setup: {...p.setup, structure: newList}} : null))} />
                    <StringListEditor title="Setup: Space" list={farmInfoDraft.setup.space} setList={(newList) => setFarmInfoDraft(p => (p ? {...p, setup: {...p.setup, space: newList}} : null))} />
                    <StringListEditor title="Equipment" list={farmInfoDraft.equipment} setList={(newList) => handleFarmInfoChange('equipment', newList)} />
                    <StringListEditor title="Broiler Care Details" list={farmInfoDraft.broilerCare.details} setList={(newList) => setFarmInfoDraft(p => (p ? {...p, broilerCare: {...p.broilerCare, details: newList}} : null))} />
                    <StringListEditor title="Layer Care Details" list={farmInfoDraft.layerCare.details} setList={(newList) => setFarmInfoDraft(p => (p ? {...p, layerCare: {...p.layerCare, details: newList}} : null))} />
                    <StringListEditor title="Health & Cleanliness" list={farmInfoDraft.health} setList={(newList) => handleFarmInfoChange('health', newList)} />
                    <StringListEditor title="Economics" list={farmInfoDraft.economics} setList={(newList) => handleFarmInfoChange('economics', newList)} />
                    <StringListEditor title="Extra Tips" list={farmInfoDraft.tips} setList={(newList) => handleFarmInfoChange('tips', newList)} />
                </div>
                <button onClick={saveFarmInfo} className={`mt-4 w-full ${neoButton} text-blue-600 dark:text-blue-400`}>Save Farm Info</button>
            </div>
        )}

        {activeTab === 'notices' && (
          <div>
            <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200">Manage Notices</h2>
                <button onClick={openAddNoticeModal} className={`${neoButton} text-green-600 dark:text-green-400`}><i className="fa-solid fa-plus mr-2"></i>Add New Notice</button>
            </div>
            <div className="flex items-center gap-2 mb-4">
                <span className="font-semibold text-sm text-gray-600 dark:text-gray-400">Filter by status:</span>
                {(['all', 'active', 'inactive'] as const).map(status => (
                    <button
                        key={status}
                        onClick={() => setNoticeFilter(status)}
                        className={`${neoButton} text-xs capitalize ${noticeFilter === status ? 'text-blue-600 dark:text-blue-400 shadow-[inset_2px_2px_4px_#bebebe,_inset_-2px_-2px_4px_#ffffff] dark:shadow-[inset_2px_2px_4px_#1c222b,_inset_-2px_-2px_4px_#2c3645]' : 'text-slate-600 dark:text-slate-300'}`}
                    >
                        {status}
                    </button>
                ))}
            </div>
            <div className="overflow-x-auto rounded-xl shadow-[inset_5px_5px_10px_#bebebe,_inset_-5px_-5px_10px_#ffffff] dark:shadow-[inset_5px_5px_10px_#1c222b,_inset_-5px_-5px_10px_#2c3645] p-2">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-slate-300 dark:border-gray-600">
                    <th className="p-3 text-left font-bold text-slate-600 dark:text-slate-300">Status</th>
                    <th className="p-3 text-left font-bold text-slate-600 dark:text-slate-300">Details</th>
                    <th className="p-3 text-left">
                      <button onClick={() => requestNoticeSort('date')} className="font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 flex items-center gap-1.5 transition-colors">
                          Date
                          {noticeSortConfig.key === 'date' && <span className="text-xs">{noticeSortConfig.direction === 'ascending' ? '▲' : '▼'}</span>}
                      </button>
                    </th>
                    <th className="p-3 text-center font-bold text-slate-600 dark:text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedNotices.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-gray-500 dark:text-gray-400">
                        No notices match the current filters.
                      </td>
                    </tr>
                  ) : (
                    filteredAndSortedNotices.map((notice, index) => (
                      <tr key={notice.id} className="border-b border-slate-300/70 dark:border-gray-700 animate-slideInFromBottom" style={{ animationDelay: `${index * 30}ms`}}>
                        <td className="p-3 align-top">
                          <div className="flex items-center gap-2">
                            <span className={`w-3 h-3 rounded-full flex-shrink-0 ${notice.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                            <span className="text-sm font-medium">{notice.isActive ? 'Active' : 'Inactive'}</span>
                          </div>
                        </td>
                        <td className="p-3 max-w-sm">
                          <p className="font-bold text-slate-800 dark:text-slate-200">{notice.title}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 whitespace-pre-wrap">{notice.content}</p>
                        </td>
                        <td className="p-3 text-sm text-gray-500 dark:text-gray-400 align-top">{notice.date}</td>
                        <td className="p-3 text-center space-x-2 align-top">
                          <button onClick={() => openEditNoticeModal(notice)} className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">Edit</button>
                          <button onClick={() => handleDeleteNotice(notice.id)} className="font-semibold text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300">Delete</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {isFeedModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 transition-opacity duration-300 animate-fadeIn"
          onClick={() => setFeedModalOpen(false)}
          aria-modal="true"
          role="dialog"
        >
          <div 
            className="bg-[#e0e5ec] p-8 rounded-2xl w-full max-w-md transform transition-transform duration-300 animate-scaleUp shadow-[10px_10px_20px_#bebebe,_-10px_-10px_20px_#ffffff] dark:bg-gray-800 dark:shadow-[10px_10px_20px_#1c222b,_-10px_-10px_20px_#2c3645]"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">{editingFeed ? 'Edit Feed' : 'Add New Feed'}</h2>
              <button onClick={() => setFeedModalOpen(false)} className="text-slate-400 dark:text-gray-500 hover:text-slate-600 dark:hover:text-gray-300 text-2xl font-bold">&times;</button>
            </div>
            <form onSubmit={handleFeedSubmit} className="space-y-4">
              <InputGroup label="Code">
                <input type="text" name="code" value={feedForm.code} onChange={handleFeedFormChange} className={`${neoInput} w-full disabled:opacity-70 disabled:shadow-none`} required disabled={!!editingFeed} />
              </InputGroup>
              <InputGroup label="Name">
                <input type="text" name="name" value={feedForm.name} onChange={handleFeedFormChange} className={`${neoInput} w-full`} required />
              </InputGroup>
              <InputGroup label="Price">
                <input type="number" name="price" value={feedForm.price} onChange={handleFeedFormChange} className={`${neoInput} w-full`} required step="0.01" min="0.01"/>
              </InputGroup>
              <InputGroup label="KG">
                <input type="number" name="kg" value={feedForm.kg} onChange={handleFeedFormChange} className={`${neoInput} w-full`} required step="1" min="1"/>
              </InputGroup>
              <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={() => setFeedModalOpen(false)} className={`${neoButton} text-slate-700 dark:text-slate-200`}>Cancel</button>
                <button type="submit" className={`${neoButton} text-green-600 dark:text-green-400`}>{editingFeed ? 'Update Feed' : 'Add Feed'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isNoticeModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 transition-opacity duration-300 animate-fadeIn"
          onClick={() => setNoticeModalOpen(false)}
          aria-modal="true"
          role="dialog"
        >
          <div 
            className="bg-[#e0e5ec] p-8 rounded-2xl w-full max-w-md transform transition-transform duration-300 animate-scaleUp shadow-[10px_10px_20px_#bebebe,_-10px_-10px_20px_#ffffff] dark:bg-gray-800 dark:shadow-[10px_10px_20px_#1c222b,_-10px_-10px_20px_#2c3645]"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">{editingNotice ? 'Edit Notice' : 'Add New Notice'}</h2>
              <button onClick={() => setNoticeModalOpen(false)} className="text-slate-400 dark:text-gray-500 hover:text-slate-600 dark:hover:text-gray-300 text-2xl font-bold">&times;</button>
            </div>
            <form onSubmit={handleNoticeSubmit} className="space-y-4">
              <InputGroup label="Title">
                <input type="text" name="title" value={noticeForm.title} onChange={handleNoticeFormChange} className={`${neoInput} w-full`} required />
              </InputGroup>
              <InputGroup label="Content">
                <textarea name="content" value={noticeForm.content} onChange={handleNoticeFormChange} className={`${neoInput} w-full h-32`} required />
              </InputGroup>
               <div className="flex items-center gap-3">
                <label htmlFor="isActiveToggle" className="font-semibold text-sm text-gray-600 dark:text-gray-400">Status:</label>
                <input
                  id="isActiveToggle"
                  type="checkbox"
                  checked={noticeForm.isActive}
                  onChange={e => setNoticeForm(p => ({...p, isActive: e.target.checked}))}
                  className="hidden"
                />
                <label htmlFor="isActiveToggle" className={`cursor-pointer w-20 h-8 rounded-full relative transition-colors duration-300 ${noticeForm.isActive ? 'bg-green-300 dark:bg-green-700' : 'bg-slate-300 dark:bg-gray-600'}`}>
                  <span className={`absolute left-1 top-1 w-6 h-6 rounded-full bg-white transition-transform duration-300 transform ${noticeForm.isActive ? 'translate-x-12' : 'translate-x-0'}`}></span>
                  <span className={`absolute top-1/2 -translate-y-1/2 font-bold text-xs transition-opacity ${noticeForm.isActive ? 'left-3 opacity-100 text-green-800' : 'left-3 opacity-0'}`}>Active</span>
                  <span className={`absolute top-1/2 -translate-y-1/2 font-bold text-xs transition-opacity ${!noticeForm.isActive ? 'right-2 opacity-100 text-slate-700' : 'right-2 opacity-0'}`}>Inactive</span>
                </label>
              </div>
              <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={() => setNoticeModalOpen(false)} className={`${neoButton} text-slate-700 dark:text-slate-200`}>Cancel</button>
                <button type="submit" className={`${neoButton} text-green-600 dark:text-green-400`}>{editingNotice ? 'Update Notice' : 'Add Notice'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isPdfPreviewModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 transition-opacity duration-300 animate-fadeIn"
          onClick={() => setPdfPreviewModalOpen(false)}
          aria-modal="true"
          role="dialog"
        >
          <div 
            className="bg-[#e0e5ec] p-8 rounded-2xl w-full max-w-2xl transform transition-transform duration-300 animate-scaleUp flex flex-col shadow-[10px_10px_20px_#bebebe,_-10px_-10px_20px_#ffffff] dark:bg-gray-800 dark:shadow-[10px_10px_20px_#1c222b,_-10px_-10px_20px_#2c3645]"
            style={{ maxHeight: '90vh' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Confirm PDF Import</h2>
              <button onClick={() => setPdfPreviewModalOpen(false)} className="text-slate-400 dark:text-gray-500 hover:text-slate-600 dark:hover:text-gray-300 text-2xl font-bold">&times;</button>
            </div>
            <p className="mb-4 text-slate-600 dark:text-slate-300 flex-shrink-0">
              Found <span className="font-bold text-green-600 dark:text-green-400">{pdfPreviewData.length}</span> items to import or update. Please review the data below before confirming.
            </p>
            <div className="overflow-y-auto rounded-lg flex-grow shadow-[inset_5px_5px_10px_#bebebe,_inset_-5px_-5px_10px_#ffffff] dark:shadow-[inset_5px_5px_10px_#1c222b,_inset_-5px_-5px_10px_#2c3645] p-2">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-[#e0e5ec] dark:bg-gray-800">
                  <tr className="border-b-2 border-slate-300 dark:border-gray-600">
                    <th className="p-2 text-left font-semibold text-slate-600 dark:text-slate-300">Code</th>
                    <th className="p-2 text-left font-semibold text-slate-600 dark:text-slate-300">Name</th>
                    <th className="p-2 text-right font-semibold text-slate-600 dark:text-slate-300">Price</th>
                    <th className="p-2 text-right font-semibold text-slate-600 dark:text-slate-300">KG</th>
                  </tr>
                </thead>
                <tbody>
                  {pdfPreviewData.map((feed, index) => (
                    <tr key={index} className="border-t border-slate-300/70 dark:border-gray-700 animate-slideInFromBottom" style={{ animationDelay: `${index * 30}ms`}}>
                      <td className="p-2">{feed.code}</td>
                      <td className="p-2">{feed.name}</td>
                      <td className="p-2 text-right">{feed.price.toFixed(2)}</td>
                      <td className="p-2 text-right">{feed.kg}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end gap-4 pt-6 flex-shrink-0">
              <button type="button" onClick={() => setPdfPreviewModalOpen(false)} className={`${neoButton} text-slate-700 dark:text-slate-200`}>Cancel</button>
              <button type="button" onClick={handleConfirmPdfImport} className={`${neoButton} text-green-600 dark:text-green-400`}>Confirm Import</button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default AdminPanel;