'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

  const handleDeleteFlippingItem = (id: string) => {
    setFlippingItems(flippingItems.filter((f) => f.id !== id));
  };

  const handleDeleteRepair = (id: string) => {
    setRepairs(repairs.filter((r) => r.id !== id));
  };

  const getPageTitle = () => {
    if (activeModule === 'recepcion') return 'Recepción';
    if (activeModule === 'taller') return 'Taller';
    return 'Mercado';
  };

  return (
    <main className="min-h-screen bg-[#000000] text-white font-['Helvetica_Neue',_Helvetica,_Arial,_sans-serif] pb-24 selection:bg-white/20">
      
      {/* HEADER */}
      <header className="px-5 sm:px-8 pt-8 sm:pt-12 pb-6 max-w-5xl mx-auto flex justify-between items-end">
        <h1 className="text-3xl sm:text-[34px] leading-none font-bold tracking-tight text-white">
          {getPageTitle()}
        </h1>
      </header>

      {/* ÁREA DE CONTENIDO */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-40">
            <div className="w-6 h-6 border-2 border-[#38383A] border-t-white rounded-full animate-spin"></div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeModule}
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="w-full"
            >
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
                  onDeleteRepair={handleDeleteRepair}
                />
              )}
              {activeModule === 'flipping' && (
                <FlippingModule
                  items={flippingItems}
                  onAddItem={handleAddFlipping}
                  onUpdateStatus={handleUpdateFlippingStatus}
                  onDeleteItem={handleDeleteFlippingItem}
                />
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* BOTTOM TAB BAR: Fondo de cristal verdadero e íconos legibles */}
      <nav className="fixed bottom-0 left-0 w-full z-50 bg-[#121212]/80 backdrop-blur-[30px] border-t border-[#38383A] pb-safe supports-[backdrop-filter]:bg-black/60 sm:bottom-6 sm:top-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-max sm:rounded-full sm:border sm:px-6 sm:py-2.5 sm:shadow-2xl">
        <div className="flex justify-around items-center h-[60px] sm:h-auto gap-2 sm:gap-6 px-4 sm:px-0">
          
          <button
            onClick={() => setActiveModule('recepcion')}
            className="flex flex-col items-center justify-center gap-1 w-[70px] transition-all"
          >
            <Smartphone 
              className={`w-[24px] h-[24px] transition-colors ${
                activeModule === 'recepcion' ? 'text-white' : 'text-[#8E8E93]'
              }`} 
              strokeWidth={activeModule === 'recepcion' ? 2.5 : 1.5}
            />
            <span className={`text-[10px] font-medium tracking-wide transition-colors ${
              activeModule === 'recepcion' ? 'text-white' : 'text-[#8E8E93]'
            }`}>
              Recepción
            </span>
          </button>
          
          <button
            onClick={() => setActiveModule('taller')}
            className="flex flex-col items-center justify-center gap-1 w-[70px] transition-all relative"
          >
            <div className="relative flex justify-center w-full">
              <Wrench 
                className={`w-[24px] h-[24px] transition-colors ${
                  activeModule === 'taller' ? 'text-white' : 'text-[#8E8E93]'
                }`}
                strokeWidth={activeModule === 'taller' ? 2.5 : 1.5}
              />
              {repairs.filter((r) => r.status !== 'entregado').length > 0 && (
                <span className="absolute -top-1.5 -right-1 bg-white text-black text-[9px] min-w-[16px] h-[16px] flex items-center justify-center rounded-full px-1 font-bold shadow-sm ring-2 ring-[#121212]">
                  {repairs.filter((r) => r.status !== 'entregado').length}
                </span>
              )}
            </div>
            <span className={`text-[10px] font-medium tracking-wide transition-colors ${
              activeModule === 'taller' ? 'text-white' : 'text-[#8E8E93]'
            }`}>
              Taller
            </span>
          </button>

          <button
            onClick={() => setActiveModule('flipping')}
            className="flex flex-col items-center justify-center gap-1 w-[70px] transition-all"
          >
            <TrendingUp 
              className={`w-[24px] h-[24px] transition-colors ${
                activeModule === 'flipping' ? 'text-white' : 'text-[#8E8E93]'
              }`}
              strokeWidth={activeModule === 'flipping' ? 2.5 : 1.5}
            />
            <span className={`text-[10px] font-medium tracking-wide transition-colors ${
              activeModule === 'flipping' ? 'text-white' : 'text-[#8E8E93]'
            }`}>
              Mercado
            </span>
          </button>

        </div>
      </nav>

      {showTicket && lastTicket && (
        <TicketModal data={lastTicket} onClose={() => setShowTicket(false)} />
      )}
    </main>
  );
}