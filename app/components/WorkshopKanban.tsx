'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Clock, DollarSign, Send, FileText, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { supabase } from './supabase';

interface WorkshopProps {
  repairs: any[];
  onUpdateStatus: (id: string, status: string) => void;
}

export default function WorkshopKanban({
  repairs,
  onUpdateStatus,
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-5 sm:space-y-6 max-w-4xl mx-auto px-2 sm:px-0"
    >
      {/* Encabezado Responsivo */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-900/60 backdrop-blur-xl border border-white/10 p-5 sm:p-6 rounded-3xl gap-4 shadow-xl">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Panel del Taller
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            {repairs.filter(r => r.status !== 'entregado').length} equipos activos en proceso
          </p>
        </div>
        <div className="w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-white/5 text-left sm:text-right">
          <p
            className={`text-3xl font-black flex items-center gap-1 tracking-tight ${
              totalRealProfit >= 0 ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            <DollarSign className="w-6 h-6 sm:w-5 sm:h-5" />
            {totalRealProfit}.00
          </p>
          <p className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wider mt-1">
            Ganancia Neta Total (Historial Incluido)
          </p>
        </div>
      </div>

      {/* Buscador y Filtros adaptados a Touch */}
      <div className="space-y-4">
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 sm:w-4 sm:h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por folio o cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 sm:py-3 bg-slate-950/80 border border-white/10 rounded-xl text-sm sm:text-base text-white focus:border-blue-500 focus:outline-none transition-all"
          />
        </div>

        {/* Contenedor de filtros con scroll horizontal oculto en móvil */}
        <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2 -mx-2 px-2 sm:mx-0 sm:px-0 sm:flex-wrap">
          {[
            { id: 'todos', label: 'Activos' },
            { id: 'por_revisar', label: 'Por Revisar' },
            { id: 'en_proceso', label: 'En Proceso' },
            { id: 'esperando_pieza', label: 'Esperando Pieza' },
            { id: 'listo', label: 'Listos' },
            { id: 'entregado', label: '📦 Entregados' }
          ].map(filter => (
            <button
              key={filter.id}
              onClick={() => setSelectedFilter(filter.id)}
              className={`whitespace-nowrap px-4 py-2 sm:px-3.5 sm:py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all border ${
                selectedFilter === filter.id 
                  ? 'bg-blue-600/20 border-blue-500 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.15)]' 
                  : 'bg-slate-950/40 border-white/5 text-slate-400 hover:bg-slate-800'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Reparaciones */}
      <div className="space-y-4">
        {filteredRepairs.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/30 border border-white/5 rounded-3xl text-slate-500 backdrop-blur-sm">
            No hay equipos en esta categoría.
          </div>
        ) : (
          filteredRepairs.map((item) => {
            const formattedDate = item.created_at ? new Date(item.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';
            const deliveredDate = item.delivered_at ? new Date(item.delivered_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : null;

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
                className={`bg-slate-950/60 backdrop-blur-md border p-4 sm:p-5 rounded-2xl flex flex-col md:flex-row justify-between gap-5 shadow-lg transition-colors ${
                  isDelivered
                    ? 'border-emerald-500/20 bg-emerald-950/5'
                    : isLoss
                    ? 'border-red-500/40 bg-red-950/10'
                    : 'border-white/5'
                }`}
              >
                {/* Columna Izquierda: Info del Equipo */}
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] sm:text-xs font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-md">
                      {item.folio}
                    </span>
                    <h3 className="font-bold text-white text-base sm:text-lg">
                      {item.model}
                    </h3>
                    {isDelivered && (
                      <span className="flex items-center gap-1 text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold mt-1 sm:mt-0">
                        <ShieldCheck className="w-3 h-3" /> Entregado
                      </span>
                    )}
                    {isLoss && !isDelivered && (
                      <span className="flex items-center gap-1 text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full font-semibold animate-pulse mt-1 sm:mt-0">
                        <AlertTriangle className="w-3 h-3" /> Pérdida
                      </span>
                    )}
                  </div>
                  
                  <div className="bg-slate-900/50 p-3 rounded-xl border border-white/5">
                    <p className="text-sm text-slate-300 leading-relaxed">
                      <strong className="text-slate-500">Falla:</strong> {item.issue}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-400">
                    <span className="bg-slate-900/80 px-2.5 py-1.5 rounded-md border border-white/5 flex items-center gap-1.5">
                      👤 {item.client}
                    </span>
                    <span className="bg-slate-900/80 px-2.5 py-1.5 rounded-md border border-white/5 flex items-center gap-1.5">
                      📞 {item.phone}
                    </span>
                    {item.password && (
                      <span className="bg-amber-500/10 text-amber-400 px-2.5 py-1.5 rounded-md border border-amber-500/20 font-mono">
                        PIN: {item.password}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-slate-500 w-full sm:w-auto pt-1 sm:pt-0">
                      <Clock className="w-3 h-3" /> Ingreso: {formattedDate}
                    </span>
                    {deliveredDate && (
                      <span className="flex items-center gap-1 text-emerald-400 w-full sm:w-auto">
                        <CheckCircle2 className="w-3 h-3" /> Entregado: {deliveredDate}
                      </span>
                    )}
                  </div>
                </div>

                {/* Columna Derecha: Finanzas y Controles */}
                <div className="flex flex-col gap-4 min-w-[100%] sm:min-w-[260px] border-t border-white/5 md:border-none pt-4 md:pt-0 justify-between">
                  
                  <select
                    value={item.status}
                    onChange={(e) => onUpdateStatus(item.id, e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 text-sm sm:text-xs rounded-xl px-4 py-3 sm:py-2.5 text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="por_revisar">Por Revisar</option>
                    <option value="en_proceso">En Proceso</option>
                    <option value="esperando_pieza">Esperando Pieza</option>
                    <option value="listo">Listo para Entrega</option>
                    <option value="entregado">Entregado (Archivado)</option>
                  </select>

                  <div
                    className={`p-4 sm:p-3 rounded-xl border text-xs space-y-3 sm:space-y-2.5 ${
                      isLoss
                        ? 'bg-red-950/30 border-red-500/30'
                        : 'bg-slate-900/50 border-white/5'
                    }`}
                  >
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <span className="text-slate-500 block text-[10px] sm:text-[9px] mb-1 sm:mb-0.5">Refacción</span>
                        <input
                          type="number"
                          defaultValue={item.partCost}
                          onBlur={(e) => handleUpdatePartCost(item.id, Number(e.target.value))}
                          className="w-full bg-slate-950 border border-white/10 rounded-lg px-2 py-2 sm:px-1 sm:py-1 text-white text-center font-semibold text-xs focus:border-blue-500 focus:outline-none"
                          placeholder="$0"
                        />
                      </div>
                      <div>
                        <span className="text-cyan-400 block text-[10px] sm:text-[9px] mb-1 sm:mb-0.5 font-medium">Cotizado</span>
                        <input
                          type="number"
                          defaultValue={item.repairPrice}
                          onBlur={(e) => handleUpdateRepairPrice(item.id, Number(e.target.value))}
                          className="w-full bg-slate-950 border border-cyan-500/30 rounded-lg px-2 py-2 sm:px-1 sm:py-1 text-cyan-300 text-center font-semibold text-xs focus:border-cyan-500 focus:outline-none"
                          placeholder="$0"
                        />
                      </div>
                      <div>
                        <span className="text-emerald-400 block text-[10px] sm:text-[9px] mb-1 sm:mb-0.5 font-medium">Anticipo</span>
                        <input
                          type="number"
                          defaultValue={item.advancePayment}
                          onBlur={(e) => handleUpdateAdvance(item.id, Number(e.target.value))}
                          className="w-full bg-slate-950 border border-emerald-500/30 rounded-lg px-2 py-2 sm:px-1 sm:py-1 text-emerald-300 text-center font-semibold text-xs focus:border-emerald-500 focus:outline-none"
                          placeholder="$0"
                        />
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-3 sm:pt-2 border-t border-white/5 text-[11px] sm:text-[11px]">
                      <span className="text-amber-400 font-medium">Resta por cobrar:</span>
                      <span className="font-bold text-amber-300 text-sm sm:text-xs">${remainingBalance}</span>
                    </div>

                    <div className="flex justify-between items-center pt-1 border-t border-white/5">
                      <span className="text-slate-400">Ganancia Neta:</span>
                      <span
                        className={`font-black text-sm sm:text-xs ${
                          isLoss ? 'text-red-400' : 'text-emerald-400'
                        }`}
                      >
                        ${profit}
                      </span>
                    </div>
                  </div>

                  {/* Botones de Acción Wpp (Más amplios para touch) */}
                  {isEarlyStage && (
                    <button
                      onClick={() => {
                        const cleanPhone = item.phone.replace(/\D/g, '');
                        const msg = `📋 *COTIZACIÓN DE SERVICIO - TECHCORE* \n\n¡Hola ${item.client}! 👋 Te enviamos el presupuesto:\n\n• *Folio:* ${item.folio}\n• *Equipo:* ${item.model}\n• *Diagnóstico:* ${item.issue}\n\n💰 *Total:* $${item.repairPrice}\n${item.advancePayment > 0 ? `💵 *Anticipo:* $${item.advancePayment}\n⏳ *Resta:* $${remainingBalance}\n` : ''}\n¿Deseamos proceder? Quedamos a tus órdenes. 🛠️`;
                        window.open(
                          `https://api.whatsapp.com/send?phone=52${cleanPhone}&text=${encodeURIComponent(
                            msg
                          )}`,
                          '_blank'
                        );
                      }}
                      className="w-full bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-xs sm:text-xs font-semibold py-3.5 sm:py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
                    >
                      <FileText className="w-4 h-4 sm:w-3.5 sm:h-3.5" /> Cotización por WhatsApp
                    </button>
                  )}

                  {isReadyStage && (
                    <button
                      onClick={() => {
                        const cleanPhone = item.phone.replace(/\D/g, '');
                        const msg = `¡Hola ${item.client}! 👋 Te saludamos de *TechCore*. Tu equipo *${item.model}* (Folio: ${item.folio}) ya está reparado y listo para entregarse.\n\n💰 *Total a pagar:* $${item.repairPrice}\n${item.advancePayment > 0 ? `💵 *Anticipo dado:* $${item.advancePayment}\n✨ *Resta por liquidar:* $${remainingBalance}\n` : ''}\n¡Te esperamos! 🛠️`;
                        window.open(
                          `https://api.whatsapp.com/send?phone=52${cleanPhone}&text=${encodeURIComponent(
                            msg
                          )}`,
                          '_blank'
                        );
                      }}
                      className="w-full bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs sm:text-xs font-semibold py-3.5 sm:py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 animate-pulse active:scale-[0.98]"
                    >
                      <Send className="w-4 h-4 sm:w-3.5 sm:h-3.5" /> ¡Avisar que ya está listo!
                    </button>
                  )}

                  {isDelivered && (
                    <button
                      onClick={() => {
                        const cleanPhone = item.phone.replace(/\D/g, '');
                        const msg = `¡Hola ${item.client}! 👋 Te saludamos de *TechCore*. Seguimiento a tu equipo *${item.model}* (Folio: ${item.folio}). ¿Todo funciona perfectamente o requieres apoyo con tu garantía? 🤝`;
                        window.open(
                          `https://api.whatsapp.com/send?phone=52${cleanPhone}&text=${encodeURIComponent(
                            msg
                          )}`,
                          '_blank'
                        );
                      }}
                      className="w-full bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 border border-purple-500/30 text-xs sm:text-xs font-semibold py-3.5 sm:py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
                    >
                      <ShieldCheck className="w-4 h-4 sm:w-3.5 sm:h-3.5" /> Seguimiento / Garantía Ws
                    </button>
                  )}

                  {!isEarlyStage && !isReadyStage && !isDelivered && (
                    <div className="text-center py-2 text-[11px] text-slate-500 italic bg-slate-900/40 rounded-xl">
                      Equipo en banco de trabajo...
                    </div>
                  )}

                </div>
              </div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}