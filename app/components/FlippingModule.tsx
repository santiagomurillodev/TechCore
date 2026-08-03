'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Tag, Copy, X, Save } from 'lucide-react';
import { supabase } from './supabase';

interface FlippingProps {
  items: any[];
  onAddItem: (item: any) => void;
  onUpdateStatus: (id: string, status: string) => void;
}

export default function FlippingModule({
  items,
  onAddItem,
  onUpdateStatus,
}: FlippingProps) {
  const [showForm, setShowForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [descriptionText, setDescriptionText] = useState('');

  const [formData, setFormData] = useState({
    item: '',
    buyPrice: '',
    repairCost: '0',
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
      repair_cost: Number(formData.repairCost),
      sell_price: Number(formData.sellPrice),
      status: 'en_reparacion',
      description: `A la venta: ${formData.item}\n\nExcelente estado. Entregas personales acordadas.\n\nPrecio: $${formData.sellPrice}\n\nRespaldo de MURILLXSTORE.`,
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
      setFormData({ item: '', buyPrice: '', repairCost: '0', sellPrice: '' });
      setShowForm(false);
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
            Ganancia Neta Obtenida
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
              placeholder="Gastos Extras ($)"
              required
              value={formData.repairCost}
              onChange={(e) =>
                setFormData({ ...formData, repairCost: e.target.value })
              }
              className="w-full px-4 py-2 bg-slate-950/80 border border-white/5 rounded-xl text-sm text-white"
            />
            <input
              type="number"
              placeholder="Precio Venta ($)"
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
              className="flex-1 py-3 rounded-xl border border-slate-600 text-slate-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-bold"
            >
              Guardar
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-slate-950/60 backdrop-blur-md border border-white/5 p-5 rounded-2xl flex flex-col justify-between shadow-lg"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-white text-base truncate pr-2">
                {item.item}
              </h3>
              <select
                value={item.status}
                onChange={(e) => onUpdateStatus(item.id, e.target.value)}
                className="text-xs rounded-lg px-2 py-1 font-medium border bg-slate-900 text-white"
              >
                <option value="en_reparacion">En Reparación</option>
                <option value="en_venta">En Venta</option>
                <option value="vendido">Vendido</option>
              </select>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs bg-slate-900/50 p-3 rounded-xl border border-white/5 text-center mb-3">
              <div>
                <p className="text-slate-500">Inversión</p>
                <p className="font-bold text-slate-300">
                  ${item.buyPrice + item.repairCost}
                </p>
              </div>
              <div className="border-x border-white/5">
                <p className="text-slate-500">Venta</p>
                <p className="font-bold text-white">${item.sellPrice}</p>
              </div>
              <div>
                <p className="text-slate-500">Utilidad</p>
                <p className="font-bold text-emerald-400">
                  ${item.sellPrice - (item.buyPrice + item.repairCost)}
                </p>
              </div>
            </div>

            <button
              onClick={() => openEditor(item)}
              className="w-full py-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 rounded-xl text-xs font-semibold transition-colors border border-blue-500/20"
            >
              Redactar Publicación
            </button>
          </div>
        ))}
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
