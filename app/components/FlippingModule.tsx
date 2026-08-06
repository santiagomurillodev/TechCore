'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Tag, Copy, X, Save, Trash2 } from 'lucide-react';
import { supabase } from './supabase';

interface FlippingProps {
  items: any[];
  onAddItem: (item: any) => void;
  onUpdateStatus: (id: string, status: string) => void;
  onDeleteItem?: (id: string) => void; // Añadimos prop para eliminar (opcional por compatibilidad)
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

  // El total solo suma los que están en estado "vendido"
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
      repair_cost: 0, // Inicia en 0, se puede editar luego si hay gastos imprevistos
      sell_price: Number(formData.sellPrice),
      status: 'en_venta', // Cambiamos el estado inicial a "en_venta"
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
    if (window.confirm('¿Estás seguro de que deseas eliminar este artículo? Esta acción no se puede deshacer.')) {
      // Eliminar de Supabase
      const { error } = await supabase
        .from('flipping_items')
        .delete()
        .eq('id', id);

      if (!error) {
         // Si tienes la función onDeleteItem pasada desde page.tsx, úsala
         if(onDeleteItem) {
            onDeleteItem(id);
         } else {
             // Fallback temporal si no has actualizado page.tsx aún
             alert('Artículo eliminado de la base de datos. Recarga la página para ver los cambios.');
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
    alert('¡Descripción copiada! Lista para pegar en Facebook Marketplace.');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 max-w-4xl mx-auto relative"
    >
      <div className="flex justify-between items-center bg-slate-900/60 backdrop-blur-xl border border-white/10 p-5 sm:p-6 rounded-3xl shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Tag className="w-5 h-5 text-blue-400" /> Marketplace
          </h2>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-emerald-400">
            ${totalFlippingProfit}.00
          </p>
          <p className="text-[10px] text-slate-500 uppercase">
            Ganancia Neta (Artículos Vendidos)
          </p>
        </div>
      </div>

      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-4 border border-dashed border-slate-600 rounded-2xl text-slate-400 font-medium hover:bg-slate-800/50 hover:text-white transition-all flex justify-center gap-2"
        >
          <Plus className="w-5 h-5" /> Registrar Nueva Inversión
        </button>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="bg-slate-900/80 border border-blue-500/30 p-5 rounded-2xl space-y-4"
        >
          <input
            type="text"
            placeholder="Equipo (Ej. iPhone 13, Nintendo Switch)"
            required
            value={formData.item}
            onChange={(e) => setFormData({ ...formData, item: e.target.value })}
            className="w-full px-4 py-3 bg-slate-950/80 border border-white/5 rounded-xl text-sm text-white"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="number"
              placeholder="Costo Compra ($)"
              required
              value={formData.buyPrice}
              onChange={(e) =>
                setFormData({ ...formData, buyPrice: e.target.value })
              }
              className="w-full px-4 py-2 bg-slate-950/80 border border-white/5 rounded-xl text-sm text-white"
            />
            <input
              type="number"
              placeholder="Precio Venta Estimado ($)"
              required
              value={formData.sellPrice}
              onChange={(e) =>
                setFormData({ ...formData, sellPrice: e.target.value })
              }
              className="w-full px-4 py-2 bg-slate-950/80 border border-emerald-500/30 rounded-xl text-sm text-emerald-400"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 py-3 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 shadow-lg shadow-blue-500/20"
            >
              Guardar Inversión
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => {
          const isSold = item.status === 'vendido';
          const totalCost = item.buyPrice + (Number(item.repairCost) || 0);
          const profit = item.sellPrice - totalCost;

          return (
            <div
              key={item.id}
              className={`bg-slate-950/60 backdrop-blur-md border p-5 rounded-2xl flex flex-col justify-between shadow-lg transition-colors ${
                isSold ? 'border-emerald-500/30 bg-emerald-950/10' : 'border-white/5'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1 pr-2">
                  <h3 className="font-bold text-white text-base truncate">
                    {item.item}
                  </h3>
                </div>
                <div className="flex gap-2 items-center">
                  <select
                    value={item.status}
                    onChange={(e) => onUpdateStatus(item.id, e.target.value)}
                    className={`text-xs rounded-lg px-2 py-1 font-medium border focus:outline-none ${
                      isSold 
                        ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' 
                        : 'bg-slate-900 border-white/10 text-white'
                    }`}
                  >
                    <option value="en_reparacion">En Reparación</option>
                    <option value="en_venta">En Venta</option>
                    <option value="vendido">Vendido</option>
                  </select>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="text-slate-500 hover:text-red-400 transition-colors p-1"
                    title="Eliminar artículo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs bg-slate-900/50 p-3 rounded-xl border border-white/5 text-center mb-3">
                <div>
                  <p className="text-slate-500">Inversión</p>
                  <p className="font-bold text-slate-300">
                    ${totalCost}
                  </p>
                </div>
                <div className="border-x border-white/5">
                  <p className="text-slate-500">Venta</p>
                  <p className="font-bold text-white">${item.sellPrice}</p>
                </div>
                <div>
                  <p className="text-slate-500">{isSold ? 'Ganancia' : 'Proyectado'}</p>
                  <p className={`font-bold ${isSold ? 'text-emerald-400' : 'text-blue-400'}`}>
                    ${profit}
                  </p>
                </div>
              </div>

              <button
                onClick={() => openEditor(item)}
                className="w-full py-2 bg-slate-800/50 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold transition-colors border border-white/5 flex items-center justify-center gap-2"
              >
                <Tag className="w-3.5 h-3.5" /> Redactar Publicación
              </button>
            </div>
          );
        })}
      </div>

      {/* MODAL DEL EDITOR DE PUBLICACIÓN */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-white/10 w-full max-w-lg rounded-2xl shadow-2xl p-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-white">
                  Editar Publicación
                </h3>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-400 mb-2">
                Prepara tu texto de venta. Lo que guardes aquí se sincronizará
                en la nube.
              </p>
              <textarea
                rows={8}
                value={descriptionText}
                onChange={(e) => setDescriptionText(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-sm text-slate-200 resize-none focus:border-blue-500 focus:outline-none mb-4"
              />

              <div className="flex gap-3">
                <button
                  onClick={saveDescription}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-semibold flex justify-center items-center gap-2"
                >
                  <Save className="w-4 h-4" /> Guardar Cambios
                </button>
                <button
                  onClick={copyToClipboard}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold flex justify-center items-center gap-2 shadow-lg shadow-blue-600/20"
                >
                  <Copy className="w-4 h-4" /> Copiar Texto
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}