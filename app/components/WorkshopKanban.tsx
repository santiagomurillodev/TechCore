'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShieldCheck, CheckCircle2, Trash2, FileText, Send, AlertTriangle, ChevronDown, Check, X, PackageOpen } from 'lucide-react';
import { supabase } from './supabase';

interface WorkshopProps {
  repairs: any[];
  onUpdateStatus: (id: string, status: string) => void;
  onDeleteRepair?: (id: string) => void;
}

export default function WorkshopKanban({
  repairs,
  onUpdateStatus,
  onDeleteRepair,
}: WorkshopProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('activos');

  const [repairToDelete, setRepairToDelete] = useState<string | null>(null);
  const [statusModalItem, setStatusModalItem] = useState<any>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Funcionalidad ⌘ K para enfocar el buscador globalmente
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

  // Formateador Financiero automático
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const filteredRepairs = repairs.filter((r) => {
    const matchesSearch = 
      r.folio.toLowerCase().includes(searchTerm.toLowerCase()) || 
      r.client.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedFilter === 'activos') {
      return matchesSearch && r.status !== 'entregado';
    }
    return matchesSearch && r.status === selectedFilter;
  });

  const totalRealProfit = repairs.reduce((acc, curr) => {
    const part = Number(curr.partCost) || 0;
    const price = Number(curr.repairPrice) || 0;
    return acc + (price - part);
  }, 0);

  const handleUpdatePartCost = async (id: string, cost: number) => {
    await supabase.from('repairs').update({ part_cost: cost }).eq('id', id);
  };

  const handleUpdateRepairPrice = async (id: string, price: number) => {
    await supabase.from('repairs').update({ repair_price: price }).eq('id', id);
  };

  const handleUpdateAdvance = async (id: string, advance: number) => {
    await supabase.from('repairs').update({ advance_payment: advance }).eq('id', id);
  };

  const requestDelete = (id: string) => {
    setRepairToDelete(id);
  };

  const confirmDelete = async () => {
    if (!repairToDelete) return;
    
    const { error } = await supabase.from('repairs').delete().eq('id', repairToDelete);
    if (!error && onDeleteRepair) {
      onDeleteRepair(repairToDelete);
    } else if (error) {
      console.error('Error al eliminar registro:', error);
    }
    setRepairToDelete(null);
  };

  const filterOptions = [
    { id: 'activos', label: 'Todos Activos' },
    { id: 'por_revisar', label: 'Por Revisar' },
    { id: 'en_proceso', label: 'En Proceso' },
    { id: 'esperando_pieza', label: 'Espera Pieza' },
    { id: 'listo', label: 'Listos' },
    { id: 'entregado', label: 'Entregados' }
  ];

  const statusOptions = [
    { value: 'por_revisar', label: 'Por Revisar' },
    { value: 'en_proceso', label: 'En Proceso' },
    { value: 'esperando_pieza', label: 'Espera Pieza' },
    { value: 'listo', label: 'Listo para Entrega' },
    { value: 'entregado', label: 'Entregado (Archivado)' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full font-['Helvetica_Neue',_Helvetica,_Arial,_sans-serif] space-y-6 relative"
    >
      <div className="px-2 pt-2 pb-4 flex justify-between items-end border-b border-[#1C1C1E]">
        <div>
          <label className="text-[11px] font-bold tracking-[0.2em] text-[#8E8E93] uppercase block mb-1">
            Ganancia Neta (Taller)
          </label>
          <p className="text-4xl font-bold text-white tracking-tight">
            ${totalRealProfit.toLocaleString('en-US')}.<span className="text-xl text-[#8E8E93]">00</span>
          </p>
        </div>
        <div className="text-right pb-1">
          <p className="text-[13px] font-medium text-[#8E8E93]">
            {repairs.filter(r => r.status !== 'entregado').length} activos
          </p>
        </div>
      </div>

      {/* Cabecera pegajosa con Glassmorphism */}
      <div className="sticky top-0 z-30 bg-[#000000]/80 backdrop-blur-xl pt-2 pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 border-b border-transparent shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        <div className="space-y-4">
          <div className="relative w-full group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8E8E93] group-focus-within:text-white transition-colors" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Buscar por folio o cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-[60px] py-4 bg-[#1C1C1E] rounded-[18px] text-[16px] text-white placeholder:text-[#8E8E93] focus:outline-none focus:ring-1 focus:ring-white/20 transition-all shadow-inner"
            />
            {/* Atajo visual decorativo / informativo */}
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

            <div className="hidden sm:grid sm:grid-cols-6 gap-2.5 w-full">
              {filterOptions.map(filter => {
                const isActive = selectedFilter === filter.id;
                return (
                  <button
                    key={filter.id}
                    onClick={() => setSelectedFilter(filter.id)}
                    className={`py-3.5 rounded-[14px] text-[13px] font-bold transition-all text-center truncate px-2 ${
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

      <motion.div layout className="space-y-5">
        <AnimatePresence mode="popLayout">
          {filteredRepairs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              key="empty-state"
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-24 h-24 bg-[#1C1C1E] rounded-full flex items-center justify-center mb-6 relative">
                <div className="absolute inset-0 bg-white/5 rounded-full blur-xl"></div>
                <PackageOpen className="w-10 h-10 text-[#8E8E93]" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Bandeja Vacía</h3>
              <p className="text-[15px] text-[#8E8E93] max-w-[250px] leading-relaxed">
                No se encontraron equipos en esta categoría o bajo esta búsqueda.
              </p>
            </motion.div>
          ) : (
            filteredRepairs.map((item) => {
              const formattedDate = item.created_at ? new Date(item.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }) : '';
              const deliveredDate = item.delivered_at ? new Date(item.delivered_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }) : null;

              const partCost = Number(item.partCost) || 0;
              const repairPrice = Number(item.repairPrice) || 0;
              const advancePayment = Number(item.advancePayment) || 0;
              const remainingBalance = repairPrice - advancePayment;
              const profit = repairPrice - partCost;
              const isLoss = profit < 0;

              const isEarlyStage = item.status === 'por_revisar' || item.status === 'esperando_pieza';
              const isReadyStage = item.status === 'listo';
              const isDelivered = item.status === 'entregado';

              const currentStatusLabel = statusOptions.find(opt => opt.value === item.status)?.label || 'Estado';

              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  key={item.id}
                  className="bg-[#1C1C1E] rounded-[24px] overflow-hidden flex flex-col md:flex-row relative"
                >
                  {isDelivered && <div className="absolute top-0 left-0 w-full h-1 md:w-1.5 md:h-full bg-[#8E8E93] z-10"></div>}
                  {isLoss && !isDelivered && <div className="absolute top-0 left-0 w-full h-1 md:w-1.5 md:h-full bg-[#FA233B] z-10"></div>}
                  {isReadyStage && <div className="absolute top-0 left-0 w-full h-1 md:w-1.5 md:h-full bg-white z-10"></div>}

                  <div className="p-5 sm:p-6 flex-1 space-y-5">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[11px] font-bold tracking-[0.15em] text-[#8E8E93] uppercase block mb-1">
                          {item.folio} • {formattedDate}
                        </span>
                        <h3 className={`font-bold text-[20px] leading-tight flex items-center gap-2 ${isDelivered ? 'text-[#8E8E93]' : 'text-white'}`}>
                          {item.model}
                          {isLoss && !isDelivered && <AlertTriangle className="w-4 h-4 text-[#FA233B]" />}
                        </h3>
                      </div>
                      <button
                        onClick={() => requestDelete(item.id)}
                        className="w-8 h-8 flex items-center justify-center bg-[#2C2C2E] hover:bg-[#FA233B] hover:text-white rounded-full text-[#8E8E93] transition-colors active:scale-95"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-[15px] text-[#EBEBF5]/80 leading-relaxed bg-[#000000]/30 p-4 rounded-[16px]">
                      {item.issue}
                    </p>

                    <div className="bg-[#2C2C2E] rounded-[16px] overflow-hidden">
                      <div className="px-4 py-3 flex justify-between items-center">
                        <span className="text-[#8E8E93] text-[14px]">Cliente</span>
                        <span className="text-white text-[15px] font-medium truncate ml-4">{item.client}</span>
                      </div>
                      <div className="h-[1px] bg-[#48484A] ml-4"></div>
                      <div className="px-4 py-3 flex justify-between items-center">
                        <span className="text-[#8E8E93] text-[14px]">Teléfono</span>
                        <span className="text-white text-[15px] font-medium">{item.phone}</span>
                      </div>
                      {item.password && (
                        <>
                          <div className="h-[1px] bg-[#48484A] ml-4"></div>
                          <div className="px-4 py-3 flex justify-between items-center">
                            <span className="text-[#8E8E93] text-[14px]">PIN / Pass</span>
                            <span className="text-white text-[15px] font-mono">{item.password}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="p-5 sm:p-6 w-full md:w-[320px] bg-[#252528] md:border-l border-[#38383A] flex flex-col justify-between gap-5">
                    
                    <button
                      onClick={() => setStatusModalItem(item)}
                      className="w-full bg-[#1C1C1E] text-white text-[15px] font-bold rounded-[16px] px-5 py-4 flex justify-between items-center active:scale-95 transition-all border border-white/5 hover:border-white/10"
                    >
                      <span>{currentStatusLabel}</span>
                      <ChevronDown className="w-4 h-4 text-[#8E8E93]" />
                    </button>

                    <div className="space-y-4">
                      <div className="bg-[#1C1C1E] rounded-[16px] overflow-hidden grid grid-cols-3 divide-x divide-[#48484A]">
                        <div className="py-3 flex flex-col items-center">
                          <label className="text-[9px] font-bold tracking-widest text-[#8E8E93] uppercase mb-1">Pieza</label>
                          <input
                            type="number"
                            defaultValue={item.partCost}
                            onBlur={(e) => handleUpdatePartCost(item.id, Number(e.target.value))}
                            className="w-full bg-transparent text-center text-white text-[15px] font-semibold focus:outline-none"
                          />
                        </div>
                        <div className="py-3 flex flex-col items-center">
                          <label className="text-[9px] font-bold tracking-widest text-[#8E8E93] uppercase mb-1">Cotizado</label>
                          <input
                            type="number"
                            defaultValue={item.repairPrice}
                            onBlur={(e) => handleUpdateRepairPrice(item.id, Number(e.target.value))}
                            className="w-full bg-transparent text-center text-white text-[15px] font-semibold focus:outline-none"
                          />
                        </div>
                        <div className="py-3 flex flex-col items-center">
                          <label className="text-[9px] font-bold tracking-widest text-[#8E8E93] uppercase mb-1">Anticipo</label>
                          <input
                            type="number"
                            defaultValue={item.advancePayment}
                            onBlur={(e) => handleUpdateAdvance(item.id, Number(e.target.value))}
                            className="w-full bg-transparent text-center text-white text-[15px] font-semibold focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex justify-between items-center px-1">
                        <span className="text-[12px] font-medium text-[#8E8E93]">Resta por cobrar</span>
                        <span className="font-bold text-[16px] text-white">{formatMoney(remainingBalance)}</span>
                      </div>
                      <div className="flex justify-between items-center px-1">
                        <span className="text-[12px] font-medium text-[#8E8E93]">Ganancia Neta</span>
                        <span className={`font-bold text-[16px] ${isLoss ? 'text-[#FA233B]' : 'text-white'}`}>
                          {formatMoney(profit)}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2">
                      {isEarlyStage && (
                        <button
                          onClick={() => {
                            const cleanPhone = item.phone.replace(/\D/g, '');
                            const msg = `📋 *COTIZACIÓN DE SERVICIO - TECHCORE* \n\n¡Hola ${item.client}! 👋 Te enviamos el presupuesto:\n\n• *Folio:* ${item.folio}\n• *Equipo:* ${item.model}\n• *Diagnóstico:* ${item.issue}\n\n💰 *Total:* ${formatMoney(item.repairPrice)}\n${item.advancePayment > 0 ? `💵 *Anticipo:* ${formatMoney(item.advancePayment)}\n⏳ *Resta:* ${formatMoney(remainingBalance)}\n` : ''}\n¿Deseamos proceder? Quedamos a tus órdenes. 🛠️`;
                            window.open(`https://api.whatsapp.com/send?phone=52${cleanPhone}&text=${encodeURIComponent(msg)}`, '_blank');
                          }}
                          className="w-full bg-white text-black py-4 rounded-[16px] text-[15px] font-bold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)]"
                        >
                          <FileText className="w-4 h-4" strokeWidth={2.5} /> Enviar Cotización
                        </button>
                      )}

                      {isReadyStage && (
                        <button
                          onClick={() => {
                            const cleanPhone = item.phone.replace(/\D/g, '');
                            const msg = `¡Hola ${item.client}! 👋 Te saludamos de *TechCore*. Tu equipo *${item.model}* (Folio: ${item.folio}) ya está reparado y listo para entregarse.\n\n💰 *Total a pagar:* ${formatMoney(item.repairPrice)}\n${item.advancePayment > 0 ? `💵 *Anticipo dado:* ${formatMoney(item.advancePayment)}\n✨ *Resta por liquidar:* ${formatMoney(remainingBalance)}\n` : ''}\n¡Te esperamos! 🛠️`;
                            window.open(`https://api.whatsapp.com/send?phone=52${cleanPhone}&text=${encodeURIComponent(msg)}`, '_blank');
                          }}
                          className="w-full bg-white text-black py-4 rounded-[16px] text-[15px] font-bold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)]"
                        >
                          <Send className="w-4 h-4" strokeWidth={2.5} /> Avisar Entrega
                        </button>
                      )}

                      {isDelivered && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-[#8E8E93] text-[13px] font-medium justify-center bg-[#1C1C1E] py-2.5 rounded-[12px]">
                            <CheckCircle2 className="w-4 h-4" /> Entregado el {deliveredDate}
                          </div>
                          <button
                            onClick={() => {
                              const cleanPhone = item.phone.replace(/\D/g, '');
                              const msg = `¡Hola ${item.client}! 👋 Te saludamos de *TechCore*. Seguimiento a tu equipo *${item.model}* (Folio: ${item.folio}). ¿Todo funciona perfectamente o requieres apoyo con tu garantía? 🤝`;
                              window.open(`https://api.whatsapp.com/send?phone=52${cleanPhone}&text=${encodeURIComponent(msg)}`, '_blank');
                            }}
                            className="w-full bg-[#1C1C1E] hover:bg-[#2C2C2E] text-white py-4 rounded-[16px] text-[15px] font-semibold flex items-center justify-center gap-2 active:scale-95 transition-all"
                          >
                            <ShieldCheck className="w-4 h-4" strokeWidth={2} /> Seguimiento Ws
                          </button>
                        </div>
                      )}

                      {!isEarlyStage && !isReadyStage && !isDelivered && (
                        <div className="text-center py-4 text-[14px] text-[#8E8E93] font-medium bg-[#1C1C1E] rounded-[16px]">
                          Equipo en proceso...
                        </div>
                      )}
                    </div>
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
        {repairToDelete && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#1C1C1E] border border-white/10 w-full max-w-sm rounded-[32px] shadow-2xl p-6 sm:p-8 flex flex-col relative"
            >
              <h3 className="text-[34px] font-black text-white tracking-tight mb-3 leading-none">
                Eliminar
              </h3>
              <p className="text-[#8E8E93] text-[16px] mb-8 leading-relaxed">
                ¿Seguro que deseas eliminar el registro de este equipo? Esta acción es irreversible.
              </p>

              <div className="flex gap-3 mt-auto">
                <button
                  onClick={() => setRepairToDelete(null)}
                  className="flex-1 py-4 bg-[#2C2C2E] hover:bg-[#3C3C3E] text-white rounded-[18px] text-[16px] font-semibold active:scale-95 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-4 bg-[#FA233B] hover:bg-[#FF3B30] text-white rounded-[18px] text-[16px] font-bold active:scale-95 transition-all shadow-[0_0_20px_rgba(250,35,59,0.3)]"
                >
                  Eliminar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}