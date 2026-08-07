'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Tag, Copy, X, Save, Trash2, ChevronDown, Check, Search, Store } from 'lucide-react';
import { supabase } from './supabase';

interface FlippingProps {
  items: any[];
  onAddItem: (item: any) => void;
  onUpdateStatus: (id: string, status: string) => void;
  onDeleteItem?: (id: string) => void;
}

export default function FlippingModule({
  items,
  onAddItem,
  onUpdateStatus,
  onDeleteItem,
}: FlippingProps) {
  const [showForm, setShowForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [descriptionText, setDescriptionText] = useState('');
  
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [statusModalItem, setStatusModalItem] = useState<any>(null);
  const [isCopied, setIsCopied] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('activos');

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Funcionalidad ⌘ K para enfocar el buscador
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Formateador Financiero
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const [formData, setFormData] = useState({
    item: '',
    buyPrice: '',
    sellPrice: '',
  });

  const totalFlippingProfit = items
    .filter((f) => f.status === 'vendido')
    .reduce(
      (acc, curr) => acc + (curr.sellPrice - (curr.buyPrice + curr.repairCost)),
      0
    );

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.item.toLowerCase().includes(searchTerm.toLowerCase());
    if (selectedFilter === 'activos') return matchesSearch && item.status !== 'vendido';
    return matchesSearch && item.status === selectedFilter;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const dbRecord = {
      item: formData.item,
      buy_price: Number(formData.buyPrice),
      repair_cost: 0,
      sell_price: Number(formData.sellPrice),
      status: 'en_venta',
      description: `A la venta: ${formData.item}\n\nExcelente estado. Entregas personales acordadas.\n\nPrecio: $${formData.sellPrice}\n\nRespaldo de TechCore.`,
    };

    const { data } = await supabase.from('flipping_items').insert([dbRecord]).select().single();

    if (data) {
      onAddItem({
        id: data.id,
        item: data.item,
        buyPrice: data.buy_price,
        repairCost: data.repair_cost,
        sellPrice: data.sell_price,
        status: data.status,
        description: data.description,
      });
      setFormData({ item: '', buyPrice: '', sellPrice: '' });
      setShowForm(false);
    }
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    const { error } = await supabase.from('flipping_items').delete().eq('id', itemToDelete);
    if (!error && onDeleteItem) onDeleteItem(itemToDelete);
    setItemToDelete(null);
  };

  const openEditor = (item: any) => {
    setSelectedItem(item);
    setDescriptionText(item.description || '');
  };

  const saveDescription = async () => {
    await supabase.from('flipping_items').update({ description: descriptionText }).eq('id', selectedItem.id);
    selectedItem.description = descriptionText;
    setSelectedItem(null);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(descriptionText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const filterOptions = [
    { id: 'activos', label: 'Todos Activos' },
    { id: 'en_reparacion', label: 'En Reparación' },
    { id: 'en_venta', label: 'En Venta' },
    { id: 'vendido', label: 'Vendidos' }
  ];

  const statusOptions = [
    { value: 'en_reparacion', label: 'En Reparación' },
    { value: 'en_venta', label: 'En Venta' },
    { value: 'vendido', label: 'Vendido' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full font-['Helvetica_Neue',_Helvetica,_Arial,_sans-serif] space-y-6 relative"
    >
      <div className="px-2 pt-2 pb-2">
        <label className="text-[11px] font-bold tracking-[0.2em] text-[#8E8E93] uppercase block mb-1">
          Ganancia Neta
        </label>
        <p className="text-4xl font-bold text-white tracking-tight">
          ${totalFlippingProfit.toLocaleString('en-US')}.<span className="text-xl text-[#8E8E93]">00</span>
        </p>
      </div>

      {/* Cabecera pegajosa con Glassmorphism */}
      <div className="sticky top-0 z-30 bg-[#000000]/80 backdrop-blur-xl pt-2 pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 border-b border-transparent shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        <div className="space-y-4">
          <div className="relative w-full group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8E8E93] group-focus-within:text-white transition-colors" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Buscar artículo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-[60px] py-4 bg-[#1C1C1E] rounded-[18px] text-[16px] text-white placeholder:text-[#8E8E93] focus:outline-none focus:ring-1 focus:ring-white/20 transition-all shadow-inner"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 text-[#8E8E93] bg-[#2C2C2E] px-2 py-1 rounded-md text-[11px] font-bold tracking-widest pointer-events-none">
              <span>⌘</span><span>K</span>
            </div>
          </div>

          <div className="pt-1">
            <div className="sm:hidden relative">
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="w-full bg-[#1C1C1E] text-white text-[16px] font-bold rounded-[16px] px-5 py-4 focus:outline-none appearance-none cursor-pointer"
              >
                {filterOptions.map(filter => (
                  <option key={filter.id} value={filter.id} className="bg-[#1C1C1E] text-white">
                    {filter.label}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none">
                <ChevronDown className="h-5 w-5 text-[#8E8E93]" />
              </div>
            </div>

            <div className="hidden sm:grid sm:grid-cols-4 gap-2.5 w-full">
              {filterOptions.map(filter => {
                const isActive = selectedFilter === filter.id;
                return (
                  <button
                    key={filter.id}
                    onClick={() => setSelectedFilter(filter.id)}
                    className={`py-3.5 rounded-[14px] text-[14px] font-bold transition-all text-center truncate px-2 ${
                      isActive 
                        ? 'bg-white text-black shadow-md' 
                        : 'bg-[#1C1C1E] text-[#8E8E93] hover:bg-[#2C2C2E] hover:text-white'
                    }`}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full bg-[#1C1C1E] text-white flex items-center justify-center gap-2 py-4 rounded-[18px] hover:bg-[#2C2C2E] active:scale-95 transition-all"
        >
          <Plus className="w-5 h-5" strokeWidth={2.5} />
          <span className="font-bold text-[17px] tracking-tight">Nueva Inversión</span>
        </button>
      ) : (
        <motion.form
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div className="space-y-2.5">
            <label className="text-[11px] font-bold tracking-[0.2em] text-[#8E8E93] uppercase ml-2 block">
              Datos de Inversión
            </label>
            <div className="bg-[#1C1C1E] rounded-[18px] overflow-hidden divide-y divide-[#38383A]">
              <input
                type="text"
                placeholder="Equipo (Ej. iPhone 13, Nintendo Switch)"
                required
                value={formData.item}
                onChange={(e) => setFormData({ ...formData, item: e.target.value })}
                className="w-full bg-transparent text-white px-5 py-4 text-[16px] placeholder:text-[#8E8E93] focus:outline-none"
              />
              <div className="flex divide-x divide-[#38383A]">
                <input
                  type="number"
                  placeholder="Costo ($)"
                  required
                  value={formData.buyPrice}
                  onChange={(e) => setFormData({ ...formData, buyPrice: e.target.value })}
                  className="w-1/2 bg-transparent text-white px-5 py-4 text-[16px] placeholder:text-[#8E8E93] focus:outline-none text-center"
                />
                <input
                  type="number"
                  placeholder="Venta ($)"
                  required
                  value={formData.sellPrice}
                  onChange={(e) => setFormData({ ...formData, sellPrice: e.target.value })}
                  className="w-1/2 bg-transparent text-white px-5 py-4 text-[16px] placeholder:text-[#8E8E93] focus:outline-none text-center font-bold"
                />
              </div>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-4 rounded-[18px] bg-[#2C2C2E] text-white hover:bg-[#3C3C3E] active:scale-[0.98] transition-all font-semibold text-[16px]">
              Cancelar
            </button>
            <button type="submit" className="flex-1 py-4 rounded-[18px] bg-white text-black font-bold hover:bg-gray-200 active:scale-[0.98] transition-all text-[16px] shadow-[0_0_20px_rgba(255,255,255,0.15)]">
              Guardar
            </button>
          </div>
        </motion.form>
      )}

      <motion.div layout className="space-y-4 mt-8 pt-2">
        <AnimatePresence mode="popLayout">
          {filteredItems.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              key="empty-state"
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-24 h-24 bg-[#1C1C1E] rounded-full flex items-center justify-center mb-6 relative">
                <div className="absolute inset-0 bg-white/5 rounded-full blur-xl"></div>
                <Store className="w-10 h-10 text-[#8E8E93]" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Sin Artículos</h3>
              <p className="text-[15px] text-[#8E8E93] max-w-[250px] leading-relaxed">No hay artículos en esta categoría o bajo esta búsqueda.</p>
            </motion.div>
          ) : (
            filteredItems.map((item) => {
              const isSold = item.status === 'vendido';
              const totalCost = item.buyPrice + (Number(item.repairCost) || 0);
              const profit = item.sellPrice - totalCost;
              const currentStatusLabel = statusOptions.find(opt => opt.value === item.status)?.label || 'Estado';

              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  key={item.id} 
                  className="bg-[#1C1C1E] p-5 rounded-[18px] flex flex-col justify-between overflow-hidden"
                >
                  <div className="flex justify-between items-center mb-6 gap-4">
                    <h3 className={`font-bold text-[17px] uppercase tracking-wider truncate ${isSold ? 'text-[#8E8E93]' : 'text-white'}`}>
                      {item.item}
                    </h3>
                    
                    <button
                      onClick={() => setStatusModalItem(item)}
                      className="flex items-center gap-1.5 bg-[#2C2C2E] hover:bg-[#3C3C3E] px-3 py-1.5 rounded-[12px] active:scale-95 transition-all shrink-0"
                    >
                      <span className={`text-[13px] font-bold ${isSold ? 'text-[#8E8E93]' : 'text-white'}`}>
                        {currentStatusLabel}
                      </span>
                      <ChevronDown className="w-3.5 h-3.5 text-[#8E8E93]" />
                    </button>
                  </div>

                  <div className="flex items-center border-b border-[#38383A] pb-5 mb-5 divide-x divide-[#38383A]">
                    <div className="flex-1 text-center px-2">
                      <p className="text-[10px] font-bold tracking-widest text-[#8E8E93] uppercase mb-1">Costo</p>
                      <p className="font-bold text-white text-[16px]">{formatMoney(totalCost)}</p>
                    </div>
                    <div className="flex-1 text-center px-2">
                      <p className="text-[10px] font-bold tracking-widest text-[#8E8E93] uppercase mb-1">Venta</p>
                      <p className="font-bold text-white text-[16px]">{formatMoney(item.sellPrice)}</p>
                    </div>
                    <div className="flex-1 text-center px-2">
                      <p className="text-[10px] font-bold tracking-widest text-[#8E8E93] uppercase mb-1">{isSold ? 'Ganancia' : 'Proyectado'}</p>
                      <p className="font-bold text-white text-[16px]">{formatMoney(profit)}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => openEditor(item)} className="flex-1 py-3.5 bg-[#2C2C2E] hover:bg-[#3C3C3E] text-white rounded-[14px] text-[15px] font-semibold transition-colors flex items-center justify-center gap-2 active:scale-95">
                      <Tag className="w-4 h-4" /> Redactar
                    </button>
                    <button onClick={() => setItemToDelete(item.id)} className="w-[52px] flex items-center justify-center bg-[#2C2C2E] hover:bg-[#3C3C3E] text-[#8E8E93] hover:text-red-400 rounded-[14px] transition-colors active:scale-95">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {statusModalItem && (
          <div className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-md p-4 pb-6 sm:pb-4">
            <motion.div
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-[#1C1C1E] border border-white/10 sm:border w-full max-w-sm rounded-[32px] sm:rounded-[32px] shadow-2xl p-6 sm:p-8 flex flex-col relative"
            >
              <h3 className="text-[34px] font-black text-white tracking-tight mb-6 leading-none text-center">Estado</h3>
              <div className="space-y-3">
                {statusOptions.map(opt => {
                  const isActive = statusModalItem.status === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => { onUpdateStatus(statusModalItem.id, opt.value); setStatusModalItem(null); }}
                      className={`w-full py-4 rounded-[18px] text-[17px] font-bold flex justify-between items-center px-6 transition-all ${isActive ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.15)]' : 'bg-[#2C2C2E] text-white hover:bg-[#3C3C3E]'}`}
                    >
                      {opt.label}
                      {isActive && <Check className="w-5 h-5" strokeWidth={3} />}
                    </button>
                  );
                })}
              </div>
              <button onClick={() => setStatusModalItem(null)} className="w-full mt-6 py-4 bg-transparent text-[#8E8E93] hover:text-white rounded-[18px] text-[17px] font-bold transition-all">Cancelar</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-md p-0 sm:p-4">
            <motion.div 
               initial={{ opacity: 0, y: "100%" }} 
               animate={{ opacity: 1, y: 0 }} 
               exit={{ opacity: 0, y: "100%" }} 
               transition={{ type: "spring", damping: 25, stiffness: 300 }} 
               className="bg-[#1C1C1E] w-full max-w-lg rounded-t-[32px] sm:rounded-[24px] shadow-2xl p-6 pt-5 max-h-[90vh] flex flex-col border-t sm:border border-white/10 pb-8 sm:pb-6"
            >
              <div className="w-12 h-1.5 bg-[#48484A] rounded-full mx-auto mb-5 sm:hidden"></div>
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-[34px] font-black text-white tracking-tight leading-none">Publicación</h3>
                <button onClick={() => setSelectedItem(null)} className="w-8 h-8 flex items-center justify-center bg-[#2C2C2E] rounded-full text-[#8E8E93] hover:text-white mt-1"><X className="w-4 h-4" strokeWidth={2.5} /></button>
              </div>
              
              <textarea 
                value={descriptionText} 
                onChange={(e) => setDescriptionText(e.target.value)} 
                className="w-full px-5 py-4 bg-[#0A0A0A] rounded-[18px] text-[16px] text-white resize-none focus:outline-none mb-5 leading-relaxed min-h-[250px] sm:min-h-[300px]" 
              />
              
              <div className="flex gap-3 mt-auto pb-safe">
                <button onClick={saveDescription} className="flex-1 py-4 bg-[#2C2C2E] hover:bg-[#3C3C3E] text-white rounded-[18px] text-[16px] font-semibold flex justify-center items-center gap-2 active:scale-95 transition-all"><Save className="w-4 h-4" /> Guardar</button>
                <button onClick={copyToClipboard} className={`flex-1 py-4 rounded-[18px] text-[16px] font-bold flex justify-center items-center gap-2 active:scale-95 transition-all ${isCopied ? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.15)]'}`}>
                  {isCopied ? <Check className="w-4 h-4" strokeWidth={3} /> : <Copy className="w-4 h-4" strokeWidth={2.5} />}
                  {isCopied ? '¡Copiado!' : 'Copiar'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {itemToDelete && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#1C1C1E] border border-white/10 w-full max-w-sm rounded-[32px] shadow-2xl p-6 sm:p-8 flex flex-col relative">
              <h3 className="text-[34px] font-black text-white tracking-tight mb-3 leading-none">Eliminar</h3>
              <p className="text-[#8E8E93] text-[16px] mb-8 leading-relaxed">¿Seguro que deseas eliminar este artículo? Esta acción es irreversible.</p>
              <div className="flex gap-3 mt-auto">
                <button onClick={() => setItemToDelete(null)} className="flex-1 py-4 bg-[#2C2C2E] hover:bg-[#3C3C3E] text-white rounded-[18px] text-[16px] font-semibold active:scale-95 transition-all">Cancelar</button>
                <button onClick={confirmDelete} className="flex-1 py-4 bg-[#FA233B] hover:bg-[#FF3B30] text-white rounded-[18px] text-[16px] font-bold active:scale-95 transition-all shadow-[0_0_20px_rgba(250,35,59,0.3)]">Eliminar</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}