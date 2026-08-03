'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from './supabase';

interface ReceptionFormProps {
  onAddRepair: (newRepair: any) => void;
  onOpenTicket: (ticketData: any) => void;
}

export default function ReceptionForm({
  onAddRepair,
  onOpenTicket,
}: ReceptionFormProps) {
  const [formData, setFormData] = useState({
    device: 'celular',
    client: '',
    phone: '',
    model: '',
    password: '',
    issue: '',
    repairPrice: 500,
    advancePayment: 0, // NUEVO: Anticipo
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newFolio = `#0${Math.floor(Math.random() * 900 + 100)}`;
    const currentDate = new Date().toISOString();
    const ticketData = { folio: newFolio, date: currentDate, ...formData };

    const dbRecord = {
      folio: newFolio,
      client: formData.client,
      phone: formData.phone,
      device_type: formData.device,
      model: formData.model,
      issue: formData.issue,
      password: formData.password || null,
      status: 'por_revisar',
      part_cost: 0,
      repair_price: Number(formData.repairPrice),
      advance_payment: Number(formData.advancePayment), // NUEVO
    };

    const { data, error } = await supabase
      .from('repairs')
      .insert([dbRecord])
      .select()
      .single();

    if (error) {
      console.error('Error al guardar en Supabase:', error);
      alert('Hubo un error al guardar el equipo. Intenta de nuevo.');
      setIsSubmitting(false);
      return;
    }

    const frontendRepairObj = {
      id: data.id,
      folio: data.folio,
      client: data.client,
      phone: data.phone,
      deviceType: data.device_type,
      created_at: currentDate,
      model: data.model,
      issue: data.issue,
      password: data.password,
      status: data.status,
      partCost: data.part_cost,
      repairPrice: data.repair_price,
      advancePayment: data.advance_payment, // NUEVO
    };

    onAddRepair(frontendRepairObj);
    onOpenTicket(ticketData);

    setFormData({
      device: 'celular',
      client: '',
      phone: '',
      model: '',
      password: '',
      issue: '',
      repairPrice: 500,
      advancePayment: 0,
    });
    setIsSubmitting(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-lg mx-auto bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/50 relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500"></div>

      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Nuevo Ingreso
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm mt-2">
          Registra la entrada y genera el folio del equipo.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-[11px] sm:text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3 ml-1">
            Selecciona el Dispositivo
          </label>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {['celular', 'computadora', 'consola'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setFormData({ ...formData, device: type })}
                className={`py-4 sm:py-5 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 ${
                  formData.device === type
                    ? 'bg-blue-600/20 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                    : 'bg-slate-950/50 border-white/5 hover:bg-slate-800'
                }`}
              >
                <span className="text-2xl sm:text-3xl">
                  {type === 'celular' && '📱'}
                  {type === 'computadora' && '💻'}
                  {type === 'consola' && '🎮'}
                </span>
                <span
                  className={`text-[10px] sm:text-xs font-medium capitalize ${
                    formData.device === type
                      ? 'text-blue-400'
                      : 'text-slate-400'
                  }`}
                >
                  {type === 'celular' ? 'Móvil' : type}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-400 ml-1">
                Nombre Completo
              </label>
              <input
                type="text"
                placeholder="Ej. Juan Pérez"
                required
                value={formData.client}
                onChange={(e) =>
                  setFormData({ ...formData, client: e.target.value })
                }
                className="w-full px-4 py-3.5 bg-slate-950/80 border border-white/5 rounded-xl focus:outline-none focus:border-blue-500 text-base sm:text-sm text-slate-200"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-400 ml-1">
                WhatsApp (10 dígitos)
              </label>
              <input
                type="tel"
                placeholder="55 1234 5678"
                required
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-4 py-3.5 bg-slate-950/80 border border-white/5 rounded-xl focus:outline-none focus:border-blue-500 text-base sm:text-sm text-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-400 ml-1">
                Marca y Modelo
              </label>
              <input
                type="text"
                placeholder="Ej. iPhone 13 Pro"
                required
                value={formData.model}
                onChange={(e) =>
                  setformData({ ...formData, model: e.target.value })
                }
                className="w-full px-4 py-3.5 bg-slate-950/80 border border-white/5 rounded-xl focus:outline-none focus:border-blue-500 text-base sm:text-sm text-slate-200"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-amber-500/70 ml-1">
                PIN / Contraseña (Opcional)
              </label>
              <input
                type="text"
                placeholder="Desbloqueo"
                value={formData.password}
                onChange={(e) =>
                  setformData({ ...formData, password: e.target.value })
                }
                className="w-full px-4 py-3.5 bg-slate-950/80 border border-white/5 rounded-xl focus:outline-none focus:border-amber-500 font-mono text-amber-400 text-base sm:text-sm"
              />
            </div>
          </div>

          {/* NUEVO: Anticipo y Precio estimado */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-emerald-400 ml-1">
                Anticipo Recibido ($)
              </label>
              <input
                type="number"
                value={formData.advancePayment}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    advancePayment: Number(e.target.value),
                  })
                }
                className="w-full px-4 py-3.5 bg-slate-950/80 border border-emerald-500/30 rounded-xl focus:outline-none focus:border-emerald-500 text-base sm:text-sm text-emerald-400 font-semibold"
                placeholder="0"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-cyan-400 ml-1">
                Precio Cotizado Inicial ($)
              </label>
              <input
                type="number"
                value={formData.repairPrice}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    repairPrice: Number(e.target.value),
                  })
                }
                className="w-full px-4 py-3.5 bg-slate-950/80 border border-cyan-500/30 rounded-xl focus:outline-none focus:border-cyan-500 text-base sm:text-sm text-cyan-300 font-semibold"
                placeholder="500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-400 ml-1">
              Falla Reportada
            </label>
            <textarea
              placeholder="Describe detalladamente el problema..."
              rows={3}
              required
              value={formData.issue}
              onChange={(e) =>
                setFormData({ ...formData, issue: e.target.value })
              }
              className="w-full px-4 py-3.5 bg-slate-950/80 border border-white/5 rounded-xl focus:outline-none focus:border-blue-500 text-base sm:text-sm text-slate-200 resize-none"
            ></textarea>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all active:scale-[0.98] mt-2 text-base sm:text-sm flex justify-center items-center gap-2"
        >
          {isSubmitting
            ? 'Guardando en la base de datos...'
            : 'Generar Ticket y Registrar'}
        </button>
      </form>
    </motion.div>
  );
}
