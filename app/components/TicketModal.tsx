'use client';

import { useState } from 'react';
import { Send, X } from 'lucide-react';

export default function TicketModal({
  data,
  onClose,
}: {
  data: any;
  onClose: () => void;
}) {
  const [isSending, setIsSending] = useState(false);

  const dateStr = data.date
    ? new Date(data.date).toLocaleDateString('es-MX', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : new Date().toLocaleDateString('es-MX');

  const handleSendWhatsApp = () => {
    setIsSending(true);
    const cleanPhone = data.phone.replace(/\D/g, '');
    const phoneToCall = cleanPhone.startsWith('52') ? cleanPhone : `52${cleanPhone}`;

    // Construimos el mensaje incluyendo finanzas solo si existen
    const hasFinancials = data.repairPrice && Number(data.repairPrice) > 0;
    const remaining = hasFinancials ? Number(data.repairPrice) - (Number(data.advancePayment) || 0) : 0;

    let message = `📋 *COMPROBANTE DE INGRESO - TECHCORE*\n\n`;
    message += `¡Hola ${data.client}! 👋 Tu equipo quedó registrado:\n\n`;
    message += `• *Folio:* ${data.folio}\n`;
    message += `• *Equipo:* ${data.model}\n`;
    message += `• *Fecha:* ${dateStr}\n`;
    message += `• *Falla:* ${data.issue}\n`;
    if (data.password) message += `• *PIN / Pass:* ${data.password}\n`;

    if (hasFinancials) {
      message += `\n💰 *Cotización:* $${data.repairPrice}\n`;
      if (data.advancePayment && Number(data.advancePayment) > 0) {
        message += `💵 *Anticipo:* $${data.advancePayment}\n`;
        message += `⏳ *Resta:* $${remaining}\n`;
      }
    }

    message += `\nTe avisaremos por este medio cuando esté listo. ¡Gracias por tu confianza! 🛠️`;

    // Abrir directamente WhatsApp para evitar bloqueos de red locales
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneToCall}&text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    setIsSending(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 font-['Helvetica_Neue',_Helvetica,_Arial,_sans-serif]">
      
      {/* Contenedor principal sin desbordamientos */}
      <div className="bg-[#1C1C1E] text-white w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl border border-white/10 flex flex-col">
        
        {/* Cabecera del Ticket */}
        <div className="text-center p-5 pb-4 border-b border-[#38383A] bg-[#252528] relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-7 h-7 bg-[#3A3A3C] rounded-full flex items-center justify-center text-[#8E8E93] hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
          
          <h2 className="text-lg font-bold tracking-tight text-white">
            TechCore
          </h2>
          <p className="text-[10px] text-[#8E8E93] uppercase tracking-[0.2em] mt-0.5">
            Comprobante de Ingreso
          </p>
          <div className="mt-3">
            <span className="text-[10px] text-[#8E8E93] uppercase tracking-wider font-semibold">
              Folio
            </span>
            <p className="text-3xl font-bold text-white tracking-tight mt-0.5">
              {data.folio}
            </p>
          </div>
        </div>

        {/* Detalles en formato Inset Grouped (Sin scroll innecesario) */}
        <div className="p-4 space-y-3 text-[13px] overflow-hidden">
          <div className="bg-[#2C2C2E] rounded-[16px] overflow-hidden">
            <div className="px-4 py-2.5 flex justify-between items-center">
              <span className="text-[#8E8E93]">Fecha</span>
              <span className="text-white font-medium text-right text-[12px]">{dateStr}</span>
            </div>
            <div className="h-[1px] bg-[#48484A] ml-4"></div>
            <div className="px-4 py-2.5 flex justify-between items-center">
              <span className="text-[#8E8E93]">Cliente</span>
              <span className="text-white font-medium text-right truncate max-w-[170px]">{data.client}</span>
            </div>
            <div className="h-[1px] bg-[#48484A] ml-4"></div>
            <div className="px-4 py-2.5 flex justify-between items-center">
              <span className="text-[#8E8E93]">Teléfono</span>
              <span className="text-white font-medium text-right">{data.phone}</span>
            </div>
            <div className="h-[1px] bg-[#48484A] ml-4"></div>
            <div className="px-4 py-2.5 flex justify-between items-center">
              <span className="text-[#8E8E93]">Equipo</span>
              <span className="text-white font-medium text-right truncate max-w-[170px]">{data.model}</span>
            </div>
            {data.password && (
              <>
                <div className="h-[1px] bg-[#48484A] ml-4"></div>
                <div className="px-4 py-2.5 flex justify-between items-center">
                  <span className="text-[#8E8E93]">PIN / Pass</span>
                  <span className="text-white font-mono">{data.password}</span>
                </div>
              </>
            )}

            {/* Campos Opcionales de Finanzas */}
            {data.repairPrice && Number(data.repairPrice) > 0 && (
              <>
                <div className="h-[1px] bg-[#48484A] ml-4"></div>
                <div className="px-4 py-2.5 flex justify-between items-center">
                  <span className="text-[#8E8E93]">Cotización</span>
                  <span className="text-white font-bold">${data.repairPrice}</span>
                </div>
              </>
            )}

            {data.advancePayment && Number(data.advancePayment) > 0 && (
              <>
                <div className="h-[1px] bg-[#48484A] ml-4"></div>
                <div className="px-4 py-2.5 flex justify-between items-center">
                  <span className="text-[#8E8E93]">Anticipo</span>
                  <span className="text-emerald-400 font-bold">${data.advancePayment}</span>
                </div>
              </>
            )}
          </div>

          <div className="bg-[#2C2C2E] px-4 py-3 rounded-[16px] space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8E8E93] block">
              Falla Reportada
            </span>
            <p className="text-[#EBEBF5]/90 leading-snug text-[12px]">
              {data.issue}
            </p>
          </div>

          <div className="text-[10px] text-[#8E8E93] px-1 space-y-0.5 leading-tight">
            <p>• 30 días límite para reclamar equipos.</p>
            <p>• Equipos mojados o sin encender no aplican garantía.</p>
          </div>
        </div>

        {/* Botones de Acción Estilo iOS */}
        <div className="p-3 bg-[#252528] border-t border-[#38383A] grid grid-cols-2 gap-2 mt-auto">
          <button
            onClick={onClose}
            className="py-3 rounded-[14px] bg-[#3A3A3C] text-white font-semibold text-[14px] hover:bg-[#48484A] active:scale-95 transition-all"
          >
            Cerrar
          </button>
          
          <button
            onClick={handleSendWhatsApp}
            disabled={isSending}
            className="py-3 rounded-[14px] bg-white text-black font-bold text-[14px] hover:bg-gray-200 active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <Send className="w-4 h-4" /> Enviar WhatsApp
          </button>
        </div>

      </div>
    </div>
  );
}