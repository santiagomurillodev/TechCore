'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Download, MessageCircle, Loader2 } from 'lucide-react';
import { jsPDF } from 'jspdf';

interface TicketProps {
  data: {
    folio: string;
    client: string;
    phone: string;
    deviceType: string;
    model: string;
    issue: string;
    password?: string;
    partCost?: number;
    repairPrice?: number;
    advancePayment?: number;
    created_at?: string;
  };
  onClose: () => void;
}

export default function TicketModal({ data, onClose }: TicketProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  // Limpiamos el folio por si ya viene con un '#' desde la base de datos
  const cleanFolio = data.folio.replace(/#/g, '');

  const formattedDate = data.created_at 
    ? new Date(data.created_at).toLocaleString('es-MX', { 
        day: '2-digit', month: 'short', year: 'numeric', 
        hour: '2-digit', minute: '2-digit' 
      }) 
    : new Date().toLocaleString('es-MX');

  const remainingBalance = (data.repairPrice || 0) - (data.advancePayment || 0);

  // Función infalible que DIBUJA el PDF desde cero (Geometría Corregida)
  const generatePurePDF = () => {
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [80, 150] });
    
    // Fondo blanco
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, 80, 150, 'F'); 

    // --- MARCA DE AGUA (Logo gigante de fondo) ---
    pdf.setDrawColor(245, 245, 245); // Gris ultra claro
    pdf.setLineWidth(3);
    // Teléfono gigante centrado (Proporción 1:1.6)
    pdf.roundedRect(17.5, 44, 45, 72, 8, 8, 'D'); 
    // Línea diagonal gigante
    pdf.line(10, 95, 70, 65);

    // --- LOGO VECTORIAL PRINCIPAL (Geometría Perfecta) ---
    // Cuadrado negro (14x14mm)
    pdf.setDrawColor(0, 0, 0);
    pdf.setFillColor(0, 0, 0);
    pdf.roundedRect(33, 8, 14, 14, 3, 3, 'F');
    // Contorno del teléfono (Proporción exacta)
    pdf.setDrawColor(255, 255, 255);
    pdf.setLineWidth(0.6);
    pdf.roundedRect(37.25, 10.6, 5.5, 8.8, 1.2, 1.2, 'D');
    // Línea de corte
    pdf.setLineWidth(0.6);
    pdf.line(35, 17, 45, 13);
    // Core (Núcleo)
    pdf.setFillColor(0, 0, 0);
    pdf.setLineWidth(0.4);
    pdf.rect(39, 14, 2, 2, 'FD');
    pdf.setFillColor(255, 255, 255);
    pdf.rect(39.6, 14.6, 0.8, 0.8, 'F');

    // --- TITULO Y ENCABEZADO ---
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.text("TECHCORE", 40, 28, { align: 'center' });
    
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    pdf.setTextColor(100, 100, 100);
    pdf.text("COMPROBANTE DE INGRESO", 40, 32, { align: 'center' });

    // Línea separadora
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.2);
    pdf.line(10, 36, 70, 36);

    // --- DATOS DEL FOLIO Y FECHA ---
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7);
    pdf.text("FOLIO", 10, 44);
    pdf.setFontSize(16);
    pdf.setTextColor(0, 0, 0);
    pdf.text(`#${cleanFolio}`, 10, 50);

    pdf.setFontSize(7);
    pdf.setTextColor(100, 100, 100);
    pdf.text("FECHA", 70, 44, { align: 'right' });
    pdf.setFontSize(8);
    pdf.setTextColor(0, 0, 0);
    pdf.text(formattedDate, 70, 50, { align: 'right' });

    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.6);
    pdf.line(10, 54, 70, 54);

    // --- DATOS DEL CLIENTE ---
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7);
    pdf.setTextColor(100, 100, 100);
    pdf.text("CLIENTE", 10, 61);
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    pdf.text(data.client, 10, 66);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.text(data.phone, 10, 71);

    // --- DATOS DEL EQUIPO ---
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7);
    pdf.setTextColor(100, 100, 100);
    pdf.text("EQUIPO INGRESADO", 10, 80);
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    pdf.text(data.model, 10, 85);
    if (data.password) {
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`PIN/Pass: ${data.password}`, 10, 90);
    }

    // --- FALLA ---
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7);
    pdf.setTextColor(100, 100, 100);
    pdf.text("MOTIVO DE INGRESO / FALLA", 10, 99);
    
    // Caja para la falla
    pdf.setDrawColor(220, 220, 220);
    pdf.setFillColor(248, 248, 248);
    pdf.roundedRect(10, 102, 60, 14, 2, 2, 'FD');
    
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(0, 0, 0);
    const splitIssue = pdf.splitTextToSize(data.issue, 56);
    pdf.text(splitIssue, 12, 107);

    // --- TERMINOS Y CONDICIONES ---
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.2);
    pdf.line(10, 124, 70, 124);

    pdf.setFontSize(6);
    pdf.setTextColor(120, 120, 120);
    const termsText = "Al dejar su equipo, el cliente acepta nuestros términos de revisión y servicio. Todo diagnóstico no aprobado puede generar costo de revisión. No nos hacemos responsables por equipos abandonados después de 30 días.";
    const splitTerms = pdf.splitTextToSize(termsText, 60);
    pdf.text(splitTerms, 40, 128, { align: 'center' });

    // Código de barras
    pdf.setDrawColor(150, 150, 150);
    pdf.setLineWidth(0.5);
    for (let i = 0; i < 20; i++) {
        const xPos = 25 + (i * 1.5);
        if (i !== 3 && i !== 7 && i !== 14) {
            pdf.line(xPos, 138, xPos, 145);
        }
    }

    return pdf;
  };

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    try {
      const pdf = generatePurePDF();
      pdf.save(`TechCore_Folio_${cleanFolio}.pdf`);
    } catch (error) {
      console.error("Error al generar el PDF:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShareWhatsApp = async () => {
    setIsGenerating(true);
    try {
      const pdf = generatePurePDF();
      const pdfBlob = pdf.output('blob');
      const file = new File([pdfBlob], `TechCore_Folio_${cleanFolio}.pdf`, { type: 'application/pdf' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Comprobante TechCore - ${cleanFolio}`,
          text: `Hola ${data.client}, adjuntamos tu comprobante de ingreso de TechCore.`,
        });
      } else {
        const cleanPhone = data.phone.replace(/\D/g, '');
        const msg = `📋 *COMPROBANTE DE INGRESO - TECHCORE*\n\n¡Hola ${data.client}! 👋 Tu equipo quedó registrado:\n\n• *Folio:* #${cleanFolio}\n• *Equipo:* ${data.model}\n• *Falla:* ${data.issue}\n\nTe avisaremos por este medio cuando esté listo o requiera revisión. ¡Gracias por tu confianza! 🛠️`;
        window.open(`https://api.whatsapp.com/send?phone=52${cleanPhone}&text=${encodeURIComponent(msg)}`, '_blank');
        pdf.save(`TechCore_Folio_${cleanFolio}.pdf`);
      }
    } catch (error) {
      console.error("Error compartiendo:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[500] overflow-y-auto bg-black/80 backdrop-blur-sm">
      <div className="min-h-full flex items-center justify-center p-4 sm:p-6">
        
        <motion.div 
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="w-full max-w-[400px] flex flex-col gap-4 my-8"
        >
          
          {/* VISTA PREVIA VISUAL DEL TICKET EN LA WEB */}
          <div className="bg-white text-black rounded-[24px] p-8 shadow-2xl relative overflow-hidden">
            
            {/* Marca de agua web */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none" className="w-[150%] h-[150%]">
                <rect x="156" y="96" width="200" height="320" rx="36" stroke="#000000" strokeWidth="16" fill="none" />
                <line x1="110" y1="360" x2="402" y2="152" stroke="#000000" strokeWidth="16" strokeLinecap="round" />
              </svg>
            </div>

            <div className="relative z-10">
              <div className="flex flex-col items-center justify-center mb-8 gap-3">
                <div className="w-14 h-14 bg-black rounded-[14px] flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none" className="w-10 h-10">
                    <rect x="156" y="96" width="200" height="320" rx="36" stroke="#FFFFFF" strokeWidth="24" fill="none" />
                    <line x1="110" y1="360" x2="402" y2="152" stroke="#FFFFFF" strokeWidth="24" strokeLinecap="round" />
                    <rect x="224" y="224" width="64" height="64" fill="#000000" stroke="#FFFFFF" strokeWidth="16" />
                    <rect x="244" y="244" width="24" height="24" fill="#FFFFFF" />
                  </svg>
                </div>
                <h2 className="text-2xl font-black tracking-[0.2em]">TECHCORE</h2>
                <p className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">Comprobante de Ingreso</p>
              </div>

              <div className="flex justify-between items-end border-b-2 border-black pb-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Folio</p>
                  <p className="text-4xl font-black leading-none">#{cleanFolio}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Fecha</p>
                  <p className="text-sm font-bold">{formattedDate}</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Cliente</p>
                  <p className="text-sm font-bold">{data.client}</p>
                  <p className="text-sm text-gray-600">{data.phone}</p>
                </div>

                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Equipo Ingresado</p>
                  <p className="text-sm font-bold">{data.model}</p>
                  {data.password && (
                    <p className="text-xs text-gray-500 mt-0.5">PIN/Pass: <span className="font-mono bg-gray-100 px-1 rounded text-black">{data.password}</span></p>
                  )}
                </div>

                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Motivo de Ingreso / Falla</p>
                  <p className="text-sm font-medium bg-gray-50 p-3 rounded-lg border border-gray-200 mt-1">{data.issue}</p>
                </div>
              </div>

              {((data.repairPrice || 0) > 0 || (data.advancePayment || 0) > 0) && (
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 font-medium">Cotización:</span>
                    <span className="font-bold">${data.repairPrice}</span>
                  </div>
                  {(data.advancePayment || 0) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 font-medium">Anticipo:</span>
                      <span className="font-bold">-${data.advancePayment}</span>
                    </div>
                  )}
                  <div className="h-px w-full bg-gray-300 my-1"></div>
                  <div className="flex justify-between text-base">
                    <span className="font-bold">Resta por pagar:</span>
                    <span className="font-black">${remainingBalance}</span>
                  </div>
                </div>
              )}

              <div className="text-center pt-4 border-t border-gray-200">
                <p className="text-[9px] text-gray-500 leading-relaxed font-medium">
                  Al dejar su equipo, el cliente acepta nuestros términos de revisión y servicio. Todo diagnóstico no aprobado puede generar costo de revisión. No nos hacemos responsables por equipos abandonados después de 30 días.
                </p>
                <div className="mt-4 flex justify-center">
                  <div className="flex gap-[2px] h-8 opacity-40">
                    {[...Array(30)].map((_, i) => (
                      <div key={i} className="bg-black h-full" style={{ width: `${(i % 4) + 1}px` }}></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button 
              onClick={handleShareWhatsApp} 
              disabled={isGenerating}
              className="w-full bg-[#25D366] text-white hover:bg-[#1DA851] py-4 rounded-[16px] text-[16px] font-bold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-[0_0_20px_rgba(37,211,102,0.3)] disabled:opacity-50"
            >
              {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <MessageCircle className="w-5 h-5" />}
              Enviar por WhatsApp
            </button>

            <div className="flex gap-3">
              <button 
                onClick={handleDownloadPDF} 
                disabled={isGenerating}
                className="flex-1 bg-[#2C2C2E] text-white hover:bg-[#3C3C3E] py-3.5 rounded-[16px] text-[15px] font-bold flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                Guardar PDF
              </button>
              
              <button 
                onClick={onClose} 
                className="flex-1 bg-transparent border border-[#38383A] text-[#8E8E93] hover:text-white hover:bg-[#1C1C1E] py-3.5 rounded-[16px] text-[15px] font-bold transition-all"
              >
                Cerrar
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}