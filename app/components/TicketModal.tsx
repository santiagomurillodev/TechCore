'use client';

import { Send, X } from 'lucide-react';

export default function TicketModal({
  data,
  onClose,
}: {
  data: any;
  onClose: () => void;
}) {
  // Formateamos la fecha
  const dateStr = data.date
    ? new Date(data.date).toLocaleDateString('es-MX', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : new Date().toLocaleDateString('es-MX');

  const handleSendWhatsApp = () => {
    // Limpiamos el teléfono por si tiene espacios o guiones
    const cleanPhone = data.phone.replace(/\D/g, '');

    // Armamos el mensaje profesional para el cliente
    const message = `¡Hola ${
      data.client
    }! 👋 Gracias por confiar en *TechCore*. 
Tu equipo ha quedado ingresado correctamente en nuestro sistema.

📋 *Detalles del Servicio:*
• *Folio:* ${data.folio}
• *Equipo:* ${data.model}
• *Fecha:* ${dateStr}
• *Falla:* ${data.issue}
${data.password ? `• *PIN / Pass:* ${data.password}\n` : ''}
Te notificaremos por este medio en cuanto esté listo para entrega o si requerimos autorización de alguna refacción. ¡Quedamos a tus órdenes! 🛠️`;

    // Abrimos la API oficial de WhatsApp
    const whatsappUrl = `https://api.whatsapp.com/send?phone=52${cleanPhone}&text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      {/* Contenedor del Ticket */}
      <div className="bg-white text-slate-900 w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl relative">
        {/* Cabecera Ticket */}
        <div className="text-center p-6 border-b border-dashed border-slate-300 bg-slate-50">
          <h2 className="text-2xl font-black tracking-tight text-slate-900">
            TechCore
          </h2>
          <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">
            Soporte Técnico Especializado
          </p>
          <div className="mt-4">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
              Folio de Servicio
            </span>
            <p className="text-3xl font-black text-blue-600">{data.folio}</p>
          </div>
        </div>

        {/* Detalles */}
        <div className="p-6 space-y-3 text-sm">
          <div className="flex justify-between pb-2 border-b border-slate-100">
            <span className="text-slate-500">Fecha:</span>
            <span className="font-semibold text-slate-800 text-right">
              {dateStr}
            </span>
          </div>
          <div className="flex justify-between pb-2 border-b border-slate-100">
            <span className="text-slate-500">Cliente:</span>
            <span className="font-semibold text-slate-800 text-right">
              {data.client}
            </span>
          </div>
          <div className="flex justify-between pb-2 border-b border-slate-100">
            <span className="text-slate-500">WhatsApp:</span>
            <span className="font-semibold text-slate-800 text-right">
              {data.phone}
            </span>
          </div>
          <div className="flex justify-between pb-2 border-b border-slate-100">
            <span className="text-slate-500">Equipo:</span>
            <span className="font-semibold text-slate-800 text-right">
              {data.model}
            </span>
          </div>
          {data.password && (
            <div className="flex justify-between pb-2 border-b border-slate-100">
              <span className="text-slate-500">PIN/Pass:</span>
              <span className="font-semibold font-mono text-amber-600 text-right">
                {data.password}
              </span>
            </div>
          )}

          <div className="pt-1">
            <span className="text-slate-500 block mb-1 text-xs font-semibold uppercase">
              Falla Reportada:
            </span>
            <p className="font-medium bg-slate-50 p-3 rounded-xl text-xs leading-relaxed text-slate-700 border border-slate-100">
              {data.issue}
            </p>
          </div>

          <div className="pt-2 text-[10px] text-slate-400 text-justify leading-tight">
            <p>
              • Después de 30 días de notificada la reparación, no nos hacemos
              responsables por equipos no reclamados.
            </p>
            <p className="mt-1">
              • Equipos mojados o que no encienden no tienen garantía.
            </p>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="p-4 bg-slate-50 grid grid-cols-2 gap-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="flex items-center justify-center gap-1.5 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" /> Cerrar
          </button>
          <button
            onClick={handleSendWhatsApp}
            className="flex items-center justify-center gap-1.5 py-3 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-600/20"
          >
            <Send className="w-4 h-4" /> Enviar Wาสพ
          </button>
        </div>
      </div>
    </div>
  );
}
