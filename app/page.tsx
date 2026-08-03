'use client';

import { useState, useEffect } from 'react';
import ReceptionForm from './components/ReceptionForm';
import WorkshopKanban from './components/WorkshopKanban';
import FlippingModule from './components/FlippingModule';
import TicketModal from './components/TicketModal';
import { Smartphone, Wrench, TrendingUp } from 'lucide-react';
import { supabase } from './components/supabase';

export default function TechCoreApp() {
  const [activeModule, setActiveModule] = useState<
    'recepcion' | 'taller' | 'flipping'
  >('recepcion');

  const [repairs, setRepairs] = useState<any[]>([]);
  const [flippingItems, setFlippingItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showTicket, setShowTicket] = useState(false);
  const [lastTicket, setLastTicket] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const { data: repairsData } = await supabase
        .from('repairs')
        .select('*')
        .order('created_at', { ascending: false });
      if (repairsData) {
        setRepairs(
          repairsData.map((r) => ({
            id: r.id,
            folio: r.folio,
            client: r.client,
            phone: r.phone,
            deviceType: r.device_type,
            model: r.model,
            issue: r.issue,
            password: r.password,
            status: r.status,
            partCost: Number(r.part_cost) || 0,
            repairPrice: Number(r.repair_price) || 0,
            advancePayment: Number(r.advance_payment) || 0,
            created_at: r.created_at,
            delivered_at: r.delivered_at,
          }))
        );
      }

      const { data: flippingData } = await supabase
        .from('flipping_items')
        .select('*')
        .order('created_at', { ascending: false });
      if (flippingData) {
        setFlippingItems(
          flippingData.map((f) => ({
            id: f.id,
            item: f.item,
            buyPrice: f.buy_price,
            repairCost: f.repair_cost,
            sellPrice: f.sell_price,
            status: f.status,
            created_at: f.created_at,
            description: f.description,
          }))
        );
      }
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const handleAddRepair = (newRepair: any) =>
    setRepairs([newRepair, ...repairs]);

  const handleUpdateRepairStatus = async (id: string, newStatus: string) => {
    const updateData: any = { status: newStatus };
    if (newStatus === 'entregado') {
      updateData.delivered_at = new Date().toISOString();
    }

    setRepairs(
      repairs.map((r) =>
        r.id === id
          ? {
              ...r,
              status: newStatus,
              delivered_at: updateData.delivered_at || r.delivered_at,
            }
          : r
      )
    );
    await supabase.from('repairs').update(updateData).eq('id', id);
  };

  const handleAddFlipping = (newItem: any) =>
    setFlippingItems([newItem, ...flippingItems]);

  const handleUpdateFlippingStatus = async (id: string, newStatus: string) => {
    setFlippingItems(
      flippingItems.map((f) => (f.id === id ? { ...f, status: newStatus } : f))
    );
    await supabase
      .from('flipping_items')
      .update({ status: newStatus })
      .eq('id', id);
  };

  return (
    <main className="min-h-screen bg-[#070B14] text-slate-100 font-sans pb-20 sm:pb-12 relative overflow-hidden selection:bg-blue-500/30">
      <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <nav className="fixed bottom-0 sm:bottom-auto sm:top-6 left-0 sm:left-1/2 sm:-translate-x-1/2 w-full sm:w-[95%] sm:max-w-4xl z-50 bg-[#0a0f1a]/90 sm:bg-slate-900/70 backdrop-blur-xl border-t sm:border border-white/10 sm:rounded-full px-2 py-2 sm:py-2 flex justify-between items-center pb-safe">
        <div className="hidden sm:flex items-center gap-2 pl-4">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center shadow-lg">
            <Wrench className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-black tracking-tight text-white">
            Tech
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
              Core
            </span>
          </span>
        </div>

        <div className="flex justify-around w-full sm:w-auto sm:justify-end gap-1 px-2 sm:px-0 sm:pr-1">
          <button
            onClick={() => setActiveModule('recepcion')}
            className={`flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-2 py-2 sm:px-5 sm:py-2.5 rounded-xl sm:rounded-full text-[10px] sm:text-sm font-semibold transition-all ${
              activeModule === 'recepcion'
                ? 'text-blue-400 sm:bg-white/10 sm:text-white sm:border border-white/10'
                : 'text-slate-500'
            }`}
          >
            <Smartphone className="w-5 h-5 sm:w-4 sm:h-4" />{' '}
            <span>Recepción</span>
          </button>
          <button
            onClick={() => setActiveModule('taller')}
            className={`flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-2 py-2 sm:px-5 sm:py-2.5 rounded-xl sm:rounded-full text-[10px] sm:text-sm font-semibold transition-all relative ${
              activeModule === 'taller'
                ? 'text-blue-400 sm:bg-white/10 sm:text-white sm:border border-white/10'
                : 'text-slate-500'
            }`}
          >
            <Wrench className="w-5 h-5 sm:w-4 sm:h-4" /> <span>Taller</span>
            {repairs.filter((r) => r.status !== 'entregado').length > 0 && (
              <span className="absolute top-1 right-2 sm:top-auto sm:right-auto sm:relative bg-blue-500 text-white text-[9px] px-1.5 py-0.5 rounded-full border border-[#0a0f1a] sm:border-none">
                {repairs.filter((r) => r.status !== 'entregado').length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveModule('flipping')}
            className={`flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-2 py-2 sm:px-5 sm:py-2.5 rounded-xl sm:rounded-full text-[10px] sm:text-sm font-semibold transition-all ${
              activeModule === 'flipping'
                ? 'text-blue-400 sm:bg-white/10 sm:text-white sm:border border-white/10'
                : 'text-slate-500'
            }`}
          >
            <TrendingUp className="w-5 h-5 sm:w-4 sm:h-4" />{' '}
            <span>Flipping</span>
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 pt-6 sm:pt-32 relative z-10">
        {isLoading ? (
          <div className="text-center py-20 text-slate-400">
            Cargando base de datos...
          </div>
        ) : (
          <>
            {activeModule === 'recepcion' && (
              <ReceptionForm
                onAddRepair={handleAddRepair}
                onOpenTicket={(ticket) => {
                  setLastTicket(ticket);
                  setShowTicket(true);
                }}
              />
            )}
            {activeModule === 'taller' && (
              <WorkshopKanban
                repairs={repairs}
                onUpdateStatus={handleUpdateRepairStatus}
              />
            )}
            {activeModule === 'flipping' && (
              <FlippingModule
                items={flippingItems}
                onAddItem={handleAddFlipping}
                onUpdateStatus={handleUpdateFlippingStatus}
              />
            )}
          </>
        )}
      </div>

      {showTicket && lastTicket && (
        <TicketModal data={lastTicket} onClose={() => setShowTicket(false)} />
      )}
    </main>
  );
}
