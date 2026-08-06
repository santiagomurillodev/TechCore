'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Tag, Copy, X, Save, Trash2 } from 'lucide-react';
import { supabase } from './supabase';

interface FlippingProps {
  items: any[];
  onAddItem: (item: any) => void;
  onUpdateStatus: (id: string, status: string) => void;
  onDeleteItem?: (id: string) => void;
}

export default function FlippingModule({
  items,
  onAddItem,
  onUpdateStatus,
  onDeleteItem,
}: FlippingProps) {
  const [showForm, setShowForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [descriptionText, setDescriptionText] = useState('');

  const [formData, setFormData] = useState({
    item: '',
    buyPrice: '',
    sellPrice: '',
  });

  const totalFlippingProfit = items
    .filter((f) => f.status === 'vendido')
    .reduce(
      (acc, curr) => acc + (curr.sellPrice - (curr.buyPrice + curr.repairCost)),
      0
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const dbRecord = {
      item: formData.item,
      buy_price: Number(formData.buyPrice),
      repair_cost: 0,
      sell_price: Number(formData.sellPrice),
      status: 'en_venta',
      description: `A la venta: ${formData.item}\n\nExcelente estado. Entregas personales acordadas.\n\nPrecio: $${formData.sellPrice}\n\nRespaldo de TechCore.`,
    };

    const { data } = await supabase
      .from('flipping_items')
      .insert([dbRecord])
      .select()
      .single();

    if (data) {
      onAddItem({
        id: data.id,
        item: data.item,
        buyPrice: data.buy_price,
        repairCost: data.repair_cost,
        sellPrice: data.sell_price,
        status: data.status,
        description: data.description,
      });
      setFormData({ item: '', buyPrice: '', sellPrice: '' });
      setShowForm(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      window.confirm(
        '¿Seguro que deseas eliminar este artículo? Esta acción es irreversible.'
      )
    ) {
      const { error } = await supabase
        .from('flipping_items')
        .delete()
        .eq('id', id);

      if (!error) {
        if (onDeleteItem) {
          onDeleteItem(id);
        } else {
          alert('Artículo eliminado. Recarga la página.');
        }
      } else {
        alert('Hubo un error al eliminar el artículo.');
        console.error(error);
      }
    }
  };

  const openEditor = (item: any) => {
    setSelectedItem(item);
    setDescriptionText(item.description || '');
  };

  const saveDescription = async () => {
    await supabase
      .from('flipping_items')
      .update({ description: descriptionText })
      .eq('id', selectedItem.id);
    selectedItem.description = descriptionText;
    setSelectedItem(null);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(descriptionText);
    alert('¡Descripción copiada! Lista para pegar en Marketplace.');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full font-['Helvetica_Neue',_Helvetica,_Arial,_sans-serif] space-y-6 pb-10"
    >
      {/* HEADER: Ganancias tipo Apple Wallet */}
      <div className="px-2 pt-2 pb-4 flex justify-between items-end border-b border-[#1C1C1E]">
        <div>
          <label className="text-[11px] font-bold tracking-[0.2em] text-[#8E8E93] uppercase block mb-1">
            Ganancia Neta
          </label>
          <p className="text-4xl font-bold text-white tracking-tight">
            ${totalFlippingProfit}.<span className="text-xl text-[#8E8E93]">00</span>
          </p>
        </div>
      </div>

      {/* BOTÓN / FORMULARIO (Estilo Inset Grouped) */}
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full bg-[#1C1C1E] text-white flex items-center justify-center gap-2 py-4 rounded-[18px] hover:bg-[#2C2C2E] active:scale-95 transition-all"
        >
          <Plus className="w-5 h-5" strokeWidth={2.5} />
          <span className="font-bold text-[17px] tracking-tight">Nueva Inversión</span>
        </button>
      ) : (
        <motion.form
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div className="space-y-2.5">
            <label className="text-[11px] font-bold tracking-[0.2em] text-[#8E8E93] uppercase ml-2 block">
              Datos de Inversión
            </label>
            
            <div className="bg-[#1C1C1E] rounded-[18px] overflow-hidden">
              <input
                type="text"
                placeholder="Equipo (Ej. iPhone 13, Nintendo Switch)"
                required
                value={formData.item}
                onChange={(e) => setFormData({ ...formData, item: e.target.value })}
                className="w-full bg-transparent text-white px-5 py-4 text-[16px] placeholder:text-[#8E8E93] focus:outline-none transition-colors"
              />
              
              <div className="h-[1px] bg-[#48484A] ml-5"></div>
              
              <div className="flex">
                <input
                  type="number"
                  placeholder="Costo ($)"
                  required
                  value={formData.buyPrice}
                  onChange={(e) => setFormData({ ...formData, buyPrice: e.target.value })}
                  className="w-1/2 bg-transparent text-white px-5 py-4 text-[16px] placeholder:text-[#8E8E93] focus:outline-none transition-colors text-center"
                />
                
                <div className="w-[1px] bg-[#48484A] my-3 shrink-0"></div>
                
                <input
                  type="number"
                  placeholder="Venta ($)"
                  required
                  value={formData.sellPrice}
                  onChange={(e) => setFormData({ ...formData, sellPrice: e.target.value })}
                  className="w-1/2 bg-transparent text-white px-5 py-4 text-[16px] placeholder:text-[#8E8E93] focus:outline-none transition-colors text-center font-bold"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 py-4 rounded-[18px] bg-[#2C2C2E] text-white hover:bg-[#3C3C3E] active:scale-[0.98] transition-all font-semibold text-[16px]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-4 rounded-[18px] bg-white text-black font-bold hover:bg-gray-200 active:scale-[0.98] transition-all text-[16px]"
            >
              Guardar
            </button>
          </div>
        </motion.form>
      )}

      {/* LISTADO DE INVENTARIO */}
      <div className="space-y-4">
        {items.map((item) => {
          const isSold = item.status === 'vendido';
          const totalCost = item.buyPrice + (Number(item.repairCost) || 0);
          const profit = item.sellPrice - totalCost;

          return (
            <div
              key={item.id}
              className="bg-[#1C1C1E] p-5 rounded-[18px] flex flex-col justify-between relative overflow-hidden"
            >
              {/* Indicador sutil si está vendido */}
              {isSold && <div className="absolute top-0 left-0 w-1.5 h-full bg-white"></div>}

              {/* Cabecera de la Tarjeta */}
              <div className="flex justify-between items-center mb-4">
                <h3 className={`font-bold text-[18px] truncate pr-4 ${isSold ? 'text-[#8E8E93]' : 'text-white'}`}>
                  {item.item}
                </h3>
                
                {/* Select Nativo iOS style */}
                <select
                  value={item.status}
                  onChange={(e) => onUpdateStatus(item.id, e.target.value)}
                  className={`bg-transparent text-[14px] font-semibold text-right focus:outline-none appearance-none ${
                    isSold ? 'text-white' : 'text-[#8E8E93]'
                  }`}
                  style={{ WebkitAppearance: 'none' }}
                >
                  <option value="en_reparacion">En Reparación</option>
                  <option value="en_venta">En Venta</option>
                  <option value="vendido">✓ Vendido</option>
                </select>
              </div>

              {/* Estadísticas de la Inversión (Estilo Inset horizontal) */}
              <div className="flex items-center border-y border-[#38383A] py-3 mb-4">
                <div className="flex-1 text-center">
                  <p className="text-[10px] font-bold tracking-widest text-[#8E8E93] uppercase mb-1">Costo</p>
                  <p className="font-semibold text-white text-[15px]">${totalCost}</p>
                </div>
                
                <div className="w-[1px] h-8 bg-[#38383A]"></div>
                
                <div className="flex-1 text-center">
                  <p className="text-[10px] font-bold tracking-widest text-[#8E8E93] uppercase mb-1">Venta</p>
                  <p className="font-semibold text-white text-[15px]">${item.sellPrice}</p>
                </div>
                
                <div className="w-[1px] h-8 bg-[#38383A]"></div>
                
                <div className="flex-1 text-center">
                  <p className="text-[10px] font-bold tracking-widest text-[#8E8E93] uppercase mb-1">
                    {isSold ? 'Ganancia' : 'Proyectado'}
                  </p>
                  <p className="font-bold text-white text-[15px]">
                    ${profit}
                  </p>
                </div>
              </div>

              {/* Controles: Redactar y Eliminar */}
              <div className="flex gap-2">
                <button
                  onClick={() => openEditor(item)}
                  className="flex-1 py-3.5 bg-[#2C2C2E] hover:bg-[#3C3C3E] text-white rounded-[14px] text-[15px] font-semibold transition-colors flex items-center justify-center gap-2 active:scale-95"
                >
                  <Tag className="w-4 h-4" /> Redactar
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="w-14 flex items-center justify-center bg-[#2C2C2E] hover:bg-[#3C3C3E] text-[#8E8E93] hover:text-white rounded-[14px] transition-colors active:scale-95"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL DEL EDITOR DE PUBLICACIÓN (Estilo Apple Modal) */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-md p-0 sm:p-4 pb-0 sm:pb-4">
            <motion.div
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-[#1C1C1E] w-full max-w-lg rounded-t-[32px] sm:rounded-[24px] shadow-2xl p-6 pt-5 max-h-[90vh] flex flex-col"
            >
              {/* Pill handler (iOS style) */}
              <div className="w-12 h-1.5 bg-[#48484A] rounded-full mx-auto mb-4 sm:hidden"></div>

              <div className="flex justify-between items-center mb-5">
                <h3 className="text-xl font-bold text-white">Publicación</h3>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="w-8 h-8 flex items-center justify-center bg-[#2C2C2E] rounded-full text-[#8E8E93] hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" strokeWidth={2.5} />
                </button>
              </div>

              <textarea
                rows={8}
                value={descriptionText}
                onChange={(e) => setDescriptionText(e.target.value)}
                className="w-full px-5 py-4 bg-[#0A0A0A] rounded-[18px] text-[16px] text-white resize-none focus:outline-none mb-5 leading-relaxed"
              />

              <div className="flex gap-3 mt-auto pb-safe">
                <button
                  onClick={saveDescription}
                  className="flex-1 py-4 bg-[#2C2C2E] hover:bg-[#3C3C3E] text-white rounded-[18px] text-[16px] font-semibold flex justify-center items-center gap-2 active:scale-95 transition-all"
                >
                  <Save className="w-4 h-4" /> Guardar
                </button>
                <button
                  onClick={copyToClipboard}
                  className="flex-1 py-4 bg-white text-black rounded-[18px] text-[16px] font-bold flex justify-center items-center gap-2 active:scale-95 transition-all"
                >
                  <Copy className="w-4 h-4" strokeWidth={2.5} /> Copiar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}