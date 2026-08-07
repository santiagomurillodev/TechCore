'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
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

  // Lógica de la Barra de Navegación Inteligente
  const { scrollY } = useScroll();
  const [hiddenNav, setHiddenNav] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (window.innerWidth < 640) {
      const previous = scrollY.getPrevious() ?? 0;
      if (latest > previous && latest > 50) {
        setHiddenNav(true);
      } else {
        setHiddenNav(false);
      }
    }
  });

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
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        html, body {
          background-color: #000000 !important;
          color: #ffffff;
          overscroll-behavior: none;
        }
        ::-webkit-scrollbar {
          display: none;
          width: 0px;
          background: transparent;
        }
        * {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
      
      {/* 
        SOLUCIÓN MAESTRA: Padding Dinámico
        Si la barra se oculta (hiddenNav = true), el padding se reduce a 24px (pb-6) para que se vea normal.
        Si la barra aparece, el padding crece a 100px para que no choque. En PC siempre es pequeño (sm:pb-10).
      */}
      <main 
        className={`min-h-[100dvh] bg-[#000000] text-white font-['Helvetica_Neue',_Helvetica,_Arial,_sans-serif] selection:bg-white/20 relative transition-all duration-300 ease-in-out sm:pb-10 ${
          hiddenNav ? 'pb-6' : 'pb-[100px]'
        }`}
      >
        
        {/* CABECERA */}
        <header className="px-5 sm:px-8 pt-10 sm:pt-14 pb-6 max-w-5xl mx-auto flex justify-between items-end">
          <h1 className="text-4xl sm:text-[46px] leading-none font-black tracking-tighter text-white">
            {getPageTitle()}
          </h1>

          {/* Menú Superior (PC) con el Indicador Activo */}
          <nav className="hidden sm:flex items-center gap-2 pb-1">
            <button
              onClick={() => setActiveModule('recepcion')}
              className={`flex items-center gap-2 transition-all font-bold text-[14px] px-4 py-2 rounded-full ${
                activeModule === 'recepcion' ? 'bg-white/10 text-white shadow-sm' : 'text-[#8E8E93] hover:text-white/80 hover:bg-white/5'
              }`}
            >
              <Smartphone className="w-[18px] h-[18px]" strokeWidth={2.5} />
              Recepción
            </button>
            
            <button
              onClick={() => setActiveModule('taller')}
              className={`flex items-center gap-2 transition-all font-bold text-[14px] px-4 py-2 rounded-full relative ${
                activeModule === 'taller' ? 'bg-white/10 text-white shadow-sm' : 'text-[#8E8E93] hover:text-white/80 hover:bg-white/5'
              }`}
            >
              <Wrench className="w-[18px] h-[18px]" strokeWidth={2.5} />
              Taller
              {repairs.filter((r) => r.status !== 'entregado').length > 0 && (
                <span className="absolute -top-1 -right-1 bg-white text-black text-[9px] min-w-[16px] h-[16px] flex items-center justify-center rounded-full px-1 font-black shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                  {repairs.filter((r) => r.status !== 'entregado').length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveModule('flipping')}
              className={`flex items-center gap-2 transition-all font-bold text-[14px] px-4 py-2 rounded-full ${
                activeModule === 'flipping' ? 'bg-white/10 text-white shadow-sm' : 'text-[#8E8E93] hover:text-white/80 hover:bg-white/5'
              }`}
            >
              <TrendingUp className="w-[18px] h-[18px]" strokeWidth={2.5} />
              Mercado
            </button>
          </nav>
        </header>

        {/* ÁREA DE CONTENIDO */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
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

        {/* NAVEGACIÓN INFERIOR (Móvil) */}
        <motion.nav 
          variants={{ visible: { y: 0 }, hidden: { y: 150 } }}
          animate={hiddenNav ? "hidden" : "visible"}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="fixed bottom-0 left-0 w-full z-40 bg-[#121212]/80 backdrop-blur-[30px] border-t border-[#38383A] pb-safe supports-[backdrop-filter]:bg-black/60 sm:hidden"
        >
          <div className="flex justify-around items-center h-[60px] gap-2 px-4">
            
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
        </motion.nav>

        {showTicket && lastTicket && (
          <TicketModal data={lastTicket} onClose={() => setShowTicket(false)} />
        )}
      </main>
    </>
  );
}