'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Smartphone, Monitor, Gamepad2 } from 'lucide-react';
import { supabase } from './supabase';

interface ReceptionFormProps {
  onAddRepair: (repair: any) => void;
  onOpenTicket: (ticket: any) => void;
}

export default function ReceptionForm({
  onAddRepair,
  onOpenTicket,
}: ReceptionFormProps) {
  const [deviceType, setDeviceType] = useState('celular');
  const [formData, setFormData] = useState({
    client: '',
    phone: '',
    model: '',
    issue: '',
    password: '',
    repairPrice: '',
    advancePayment: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const folio = `#${Math.floor(1000 + Math.random() * 9000)}`;
    const currentDate = new Date().toISOString();
    
    const dbRecord = {
      folio,
      client: formData.client,
      phone: formData.phone,
      device_type: deviceType,
      model: formData.model,
      issue: formData.issue,
      password: formData.password || null,
      status: 'por_revisar',
      part_cost: 0,
      repair_price: Number(formData.repairPrice) || 0,
      advance_payment: Number(formData.advancePayment) || 0,
    };

    const { data, error } = await supabase
      .from('repairs')
      .insert([dbRecord])
      .select()
      .single();

    if (error) {
      console.error(error);
      alert('Error al guardar la orden.');
      setIsSubmitting(false);
      return;
    }

    const newRepair = {
      id: data.id,
      folio: data.folio,
      client: data.client,
      phone: data.phone,
      deviceType: data.device_type,
      model: data.model,
      issue: data.issue,
      password: data.password,
      status: data.status,
      partCost: data.part_cost,
      repairPrice: data.repair_price,
      advancePayment: data.advance_payment,
      created_at: currentDate,
    };

    onAddRepair(newRepair);

    const ticketData = {
      folio: newRepair.folio,
      client: newRepair.client,
      phone: newRepair.phone,
      model: newRepair.model,
      issue: newRepair.issue,
      password: newRepair.password,
      date: currentDate,
    };

    setFormData({ 
      client: '', phone: '', model: '', issue: '', password: '', repairPrice: '', advancePayment: ''
    });
    setDeviceType('celular');
    setIsSubmitting(false);
    onOpenTicket(ticketData);
  };

  const devices = [
    { id: 'celular', label: 'Móvil', icon: Smartphone },
    { id: 'computadora', label: 'PC / Mac', icon: Monitor },
    { id: 'consola', label: 'Consola', icon: Gamepad2 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full font-['Helvetica_Neue',_Helvetica,_Arial,_sans-serif]"
    >
      <form onSubmit={handleSubmit} className="space-y-8 pb-10">
        
        {/* SELECTOR DE DISPOSITIVO */}
        <div className="space-y-2.5">
          <label className="text-[11px] font-bold tracking-[0.2em] text-[#8E8E93] uppercase ml-2">
            Tipo de Equipo
          </label>
          <div className="grid grid-cols-3 gap-3">
            {devices.map((device) => {
              const Icon = device.icon;
              const isActive = deviceType === device.id;
              return (
                <button
                  key={device.id}
                  type="button"
                  onClick={() => setDeviceType(device.id)}
                  className={`py-4 rounded-[18px] flex flex-col items-center justify-center gap-2 transition-all duration-200 active:scale-95 ${
                    isActive
                      ? 'bg-white text-black shadow-lg'
                      : 'bg-[#1C1C1E] text-[#8E8E93] hover:bg-[#2C2C2E]'
                  }`}
                >
                  <Icon 
                    className={`w-6 h-6 ${isActive ? 'fill-black/10' : ''}`} 
                    strokeWidth={isActive ? 2 : 1.5} 
                  />
                  <span className={`text-[12px] tracking-wide ${isActive ? 'font-bold' : 'font-medium'}`}>
                    {device.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* DATOS DEL CLIENTE (Líneas de borde a borde usando divide-y) */}
        <div className="space-y-2.5">
          <label className="text-[11px] font-bold tracking-[0.2em] text-[#8E8E93] uppercase ml-2 block mt-1">
            Datos del Cliente
          </label>
          
          <div className="bg-[#1C1C1E] rounded-[18px] overflow-hidden divide-y divide-[#38383A]">
            <input
              type="text"
              required
              placeholder="Nombre completo"
              value={formData.client}
              onChange={(e) => setFormData({ ...formData, client: e.target.value })}
              className="w-full bg-transparent text-white px-5 py-4 text-[16px] placeholder:text-[#8E8E93] focus:outline-none transition-colors"
            />
            
            <input
              type="tel"
              required
              placeholder="WhatsApp (10 dígitos)"
              pattern="[0-9]{10}"
              maxLength={10}
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
              className="w-full bg-transparent text-white px-5 py-4 text-[16px] placeholder:text-[#8E8E93] focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* DETALLES TÉCNICOS (Líneas de borde a borde) */}
        <div className="space-y-2.5">
          <label className="text-[11px] font-bold tracking-[0.2em] text-[#8E8E93] uppercase ml-2 block mt-1">
            Detalles Técnicos
          </label>
          
          <div className="bg-[#1C1C1E] rounded-[18px] overflow-hidden divide-y divide-[#38383A]">
            <div className="flex divide-x divide-[#38383A]">
              <input
                type="text"
                required
                placeholder="Modelo del equipo"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-2/3 bg-transparent text-white px-5 py-4 text-[16px] placeholder:text-[#8E8E93] focus:outline-none transition-colors"
              />
              
              <input
                type="text"
                placeholder="PIN / Pass"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-1/3 bg-transparent text-white px-4 py-4 text-[16px] placeholder:text-[#8E8E93] focus:outline-none transition-colors font-mono text-center"
              />
            </div>

            <textarea
              required
              placeholder="Descripción de la falla..."
              value={formData.issue}
              onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
              rows={3}
              className="w-full bg-transparent text-white px-5 py-4 text-[16px] placeholder:text-[#8E8E93] focus:outline-none transition-colors resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* FINANZAS (Líneas de borde a borde) */}
        <div className="space-y-2.5">
          <label className="text-[11px] font-bold tracking-[0.2em] text-[#8E8E93] uppercase ml-2 block mt-1">
            Finanzas
          </label>
          
          <div className="bg-[#1C1C1E] rounded-[18px] overflow-hidden flex divide-x divide-[#38383A]">
            <input
              type="number"
              placeholder="Cotización ($)"
              value={formData.repairPrice}
              onChange={(e) => setFormData({ ...formData, repairPrice: e.target.value })}
              className="w-1/2 bg-transparent text-white px-5 py-4 text-[16px] placeholder:text-[#8E8E93] focus:outline-none transition-colors font-semibold text-center"
            />
            
            <input
              type="number"
              placeholder="Anticipo ($)"
              value={formData.advancePayment}
              onChange={(e) => setFormData({ ...formData, advancePayment: e.target.value })}
              className="w-1/2 bg-transparent text-white px-5 py-4 text-[16px] placeholder:text-[#8E8E93] focus:outline-none transition-colors font-semibold text-center"
            />
          </div>
        </div>

        {/* BOTÓN SUBMIT */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-white text-black flex items-center justify-center gap-2 py-4 rounded-[18px] mt-2 hover:bg-gray-200 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100"
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
          ) : (
            <span className="font-bold text-[17px] tracking-tight">Procesar Ingreso</span>
          )}
        </button>

      </form>
    </motion.div>
  );
}