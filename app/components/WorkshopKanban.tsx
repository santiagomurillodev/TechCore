'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, ShieldCheck, CheckCircle2, Trash2, FileText, Send, AlertTriangle } from 'lucide-react';
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
  const [selectedFilter, setSelectedFilter] = useState('todos');

  const filteredRepairs = repairs.filter((r) => {
    const matchesSearch = 
      r.folio.toLowerCase().includes(searchTerm.toLowerCase()) || 
      r.client.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedFilter === 'todos') {
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

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Eliminar este registro? Esta acción es irreversible.')) {
      const { error } = await supabase.from('repairs').delete().eq('id', id);
      if (!error) {
        if (onDeleteRepair) onDeleteRepair(id);
      } else {
        alert('Hubo un error al eliminar el registro.');
        console.error(error);
      }
    }
  };

  const filterOptions = [
    { id: 'todos', label: 'Activos' },
    { id: 'por_revisar', label: 'Por Revisar' },
    { id: 'en_proceso', label: 'En Proceso' },
    { id: 'esperando_pieza', label: 'Espera Pieza' },
    { id: 'listo', label: 'Listos' },
    { id: 'entregado', label: 'Entregados' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full font-['Helvetica_Neue',_Helvetica,_Arial,_sans-serif] space-y-6 pb-10"
    >
      {/* HEADER */}
      <div className="px-2 pt-2 pb-4 flex justify-between items-end border-b border-[#1C1C1E]">
        <div>
          <label className="text-[11px] font-bold tracking-[0.2em] text-[#8E8E93] uppercase block mb-1">
            Ganancia Neta (Taller)
          </label>
          <p className="text-4xl font-bold text-white tracking-tight">
            ${totalRealProfit}.<span className="text-xl text-[#8E8E93]">00</span>
          </p>
        </div>
        <div className="text-right pb-1">
          <p className="text-[13px] font-medium text-[#8E8E93]">
            {repairs.filter(r => r.status !== 'entregado').length} activos
          </p>
        </div>
      </div>

      {/* BUSCADOR Y FILTROS */}
      <div className="space-y-4">
        {/* Barra de Búsqueda (Ocupa el 100% del ancho) */}
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8E8E93]" />
          <input
            type="text"
            placeholder="Buscar por folio o cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-5 py-4 bg-[#1C1C1E] rounded-[18px] text-[16px] text-white placeholder:text-[#8E8E93] focus:outline-none transition-all"
          />
        </div>

        {/* Filtros Responsivos */}
        <div className="pt-1">
          {/* Select nativo para Móvil */}
          <div className="sm:hidden relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Filter className="h-4 w-4 text-white" />
            </div>
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="w-full bg-white text-black text-[16px] font-bold rounded-[16px] pl-10 pr-4 py-3.5 focus:outline-none appearance-none"
            >
              {filterOptions.map(filter => (
                <option key={filter.id} value={filter.id}>
                  {filter.label}
                </option>
              ))}
            </select>
          </div>

          {/* Grid de 6 columnas para PC (alineado perfectamente al ancho de la barra de búsqueda) */}
          <div className="hidden sm:grid grid-cols-6 gap-2.5 w-full">
            {filterOptions.map(filter => {
              const isActive = selectedFilter === filter.id;
              return (
                <button
                  key={filter.id}
                  onClick={() => setSelectedFilter(filter.id)}
                  className={`py-3 rounded-[14px] text-[13px] font-medium transition-all text-center truncate px-2 ${
                    isActive 
                      ? 'bg-white text-black font-bold shadow-md' 
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

      {/* GRID DE REPARACIONES */}
      <div className="space-y-5">
        {filteredRepairs.length === 0 ? (
          <div className="text-center py-16 text-[#8E8E93] font-medium text-[15px]">
            No hay equipos en esta categoría.
          </div>
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

            return (
              <div
                key={item.id}
                className="bg-[#1C1C1E] rounded-[24px] overflow-hidden flex flex-col md:flex-row relative"
              >
                {/* Indicadores de estado visuales */}
                {isDelivered && <div className="absolute top-0 left-0 w-full h-1 md:w-1.5 md:h-full bg-[#8E8E93] z-10"></div>}
                {isLoss && !isDelivered && <div className="absolute top-0 left-0 w-full h-1 md:w-1.5 md:h-full bg-[#FA233B] z-10"></div>}
                {isReadyStage && <div className="absolute top-0 left-0 w-full h-1 md:w-1.5 md:h-full bg-white z-10"></div>}

                {/* COLUMNA IZQUIERDA: Info Técnica */}
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
                      onClick={() => handleDelete(item.id)}
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

                {/* COLUMNA DERECHA: Finanzas y Controles */}
                <div className="p-5 sm:p-6 w-full md:w-[320px] bg-[#252528] md:border-l border-[#38383A] flex flex-col justify-between gap-5">
                  
                  {/* Select Nativo iOS */}
                  <div className="relative">
                    <select
                      value={item.status}
                      onChange={(e) => onUpdateStatus(item.id, e.target.value)}
                      className="w-full bg-[#1C1C1E] text-white text-[15px] font-bold rounded-[16px] px-4 py-3.5 focus:outline-none appearance-none"
                    >
                      <option value="por_revisar">Por Revisar</option>
                      <option value="en_proceso">En Proceso</option>
                      <option value="esperando_pieza">Espera Pieza</option>
                      <option value="listo">Listo para Entrega</option>
                      <option value="entregado">Entregado (Archivado)</option>
                    </select>
                  </div>

                  {/* Finanzas */}
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
                      <span className="font-bold text-[16px] text-white">${remainingBalance}</span>
                    </div>
                    <div className="flex justify-between items-center px-1">
                      <span className="text-[12px] font-medium text-[#8E8E93]">Ganancia Neta</span>
                      <span className={`font-bold text-[16px] ${isLoss ? 'text-[#FA233B]' : 'text-white'}`}>
                        ${profit}
                      </span>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="pt-2">
                    {isEarlyStage && (
                      <button
                        onClick={() => {
                          const cleanPhone = item.phone.replace(/\D/g, '');
                          const msg = `📋 *COTIZACIÓN DE SERVICIO - TECHCORE* \n\n¡Hola ${item.client}! 👋 Te enviamos el presupuesto:\n\n• *Folio:* ${item.folio}\n• *Equipo:* ${item.model}\n• *Diagnóstico:* ${item.issue}\n\n💰 *Total:* $${item.repairPrice}\n${item.advancePayment > 0 ? `💵 *Anticipo:* $${item.advancePayment}\n⏳ *Resta:* $${remainingBalance}\n` : ''}\n¿Deseamos proceder? Quedamos a tus órdenes. 🛠️`;
                          window.open(`https://api.whatsapp.com/send?phone=52${cleanPhone}&text=${encodeURIComponent(msg)}`, '_blank');
                        }}
                        className="w-full bg-white text-black py-4 rounded-[16px] text-[15px] font-bold flex items-center justify-center gap-2 active:scale-95 transition-all"
                      >
                        <FileText className="w-4 h-4" strokeWidth={2.5} /> Enviar Cotización
                      </button>
                    )}

                    {isReadyStage && (
                      <button
                        onClick={() => {
                          const cleanPhone = item.phone.replace(/\D/g, '');
                          const msg = `¡Hola ${item.client}! 👋 Te saludamos de *TechCore*. Tu equipo *${item.model}* (Folio: ${item.folio}) ya está reparado y listo para entregarse.\n\n💰 *Total a pagar:* $${item.repairPrice}\n${item.advancePayment > 0 ? `💵 *Anticipo dado:* $${item.advancePayment}\n✨ *Resta por liquidar:* $${remainingBalance}\n` : ''}\n¡Te esperamos! 🛠️`;
                          window.open(`https://api.whatsapp.com/send?phone=52${cleanPhone}&text=${encodeURIComponent(msg)}`, '_blank');
                        }}
                        className="w-full bg-white text-black py-4 rounded-[16px] text-[15px] font-bold flex items-center justify-center gap-2 active:scale-95 transition-all"
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
              </div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}