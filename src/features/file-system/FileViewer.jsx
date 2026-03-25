import React from 'react';
import { Download, FileText, Music, Video, Image as ImageIcon, File, Sparkles } from 'lucide-react';

const FileViewer = ({ file }) => {
  const { url, fileFormat, name } = file;
  
  // Normalizamos el formato a minúsculas
  let format = (fileFormat || "").toLowerCase();
  
  if (!format && name) {
      const parts = name.split('.');
      if (parts.length > 1) {
          format = parts.pop().toLowerCase();
      }
  }

  console.log("📂 FileViewer intentando abrir:", { name, format, url }); // Debug en consola

  // --- 1. IMÁGENES ---
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(format)) {
    return (
      <div className="relative flex flex-col items-center justify-center h-full bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-[#0a0a0f] dark:via-[#121218] dark:to-[#1a1a24] p-8 overflow-hidden transition-all duration-300">
        {/* Efectos de fondo decorativos */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 dark:from-blue-500/10 dark:to-purple-500/10"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-3xl"></div>
        
        {/* Contenedor de la imagen con efecto glassmorphism */}
        <div className="relative z-10 max-w-full max-h-full p-4 bg-white/40 dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-white/10 shadow-2xl animate-fade-in">
          <img 
            src={url} 
            alt={name} 
            className="max-w-full max-h-[calc(100vh-200px)] object-contain rounded-xl shadow-2xl"
          />
        </div>
        
        {/* Nombre del archivo */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 px-6 py-3 bg-white/80 dark:bg-black/60 backdrop-blur-xl rounded-full border border-slate-200 dark:border-white/10 shadow-lg animate-fade-in-up">
          <div className="flex items-center gap-2">
            <ImageIcon size={16} className="text-blue-500 dark:text-blue-400" />
            <span className="text-sm font-medium text-slate-800 dark:text-white max-w-md truncate">{name}</span>
          </div>
        </div>
      </div>
    );
  }

  // --- 2. PDF ---
  if (format === 'pdf') {
    return (
      <div className="relative h-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-[#0a0a0f] dark:to-[#121218] transition-colors duration-300">
        {/* Barra superior con info */}
        <div className="absolute top-0 left-0 right-0 z-10 px-6 py-4 bg-white/80 dark:bg-black/60 backdrop-blur-xl border-b border-slate-200 dark:border-white/10 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 dark:bg-red-500/20 rounded-lg">
              <FileText size={20} className="text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-white">{name}</h3>
              <p className="text-xs text-slate-500 dark:text-gray-400">Documento PDF</p>
            </div>
          </div>
        </div>
        
        <iframe 
          src={url} 
          className="w-full h-full border-none pt-16" 
          title={name}
        />
      </div>
    );
  }

  // --- 3. AUDIO (MP3, WAV) ---
  if (['mp3', 'wav', 'ogg'].includes(format)) {
    return (
      <div className="relative flex flex-col items-center justify-center h-full bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-[#1a0a1f] dark:via-[#0f0a1a] dark:to-[#0a0f1a] p-10 overflow-hidden transition-all duration-300">
        {/* Efectos animados de fondo */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10 dark:from-purple-500/20 dark:via-pink-500/20 dark:to-blue-500/20"></div>
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/20 dark:bg-purple-500/10 rounded-full blur-3xl animate-pulse-subtle"></div>
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-pink-500/20 dark:bg-pink-500/10 rounded-full blur-3xl animate-pulse-subtle" style={{ animationDelay: '1s' }}></div>
        
        {/* Visualizador de música */}
        <div className="relative z-10 flex flex-col items-center animate-scale-in">
          {/* Círculo principal con ícono */}
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 dark:from-purple-600 dark:to-pink-600 rounded-full blur-2xl opacity-50 animate-pulse-subtle"></div>
            <div className="relative w-48 h-48 bg-gradient-to-br from-purple-500/20 to-pink-500/20 dark:from-purple-600/30 dark:to-pink-600/30 backdrop-blur-xl rounded-full flex items-center justify-center border-4 border-white/20 dark:border-white/10 shadow-2xl">
              <Music size={72} className="text-purple-600 dark:text-purple-300" strokeWidth={1.5} />
            </div>
          </div>
          
          {/* Información del archivo */}
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2 max-w-md truncate">{name}</h3>
            <div className="flex items-center gap-2 justify-center">
              <div className="w-2 h-2 bg-purple-500 dark:bg-purple-400 rounded-full animate-pulse"></div>
              <p className="text-sm text-slate-600 dark:text-gray-400 uppercase tracking-wider font-medium">
                Reproduciendo Audio • {format.toUpperCase()}
              </p>
            </div>
          </div>
          
          {/* Reproductor de audio estilizado */}
          <div className="w-full max-w-2xl px-8 py-6 bg-white/50 dark:bg-black/30 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl">
            <audio controls autoPlay className="w-full">
              <source src={url} type={`audio/${format}`} />
              Tu navegador no soporta este audio.
            </audio>
          </div>
        </div>
      </div>
    );
  }

  // --- 4. VIDEO (MP4, WEBM) ---
  if (['mp4', 'webm', 'mov'].includes(format)) {
    return (
      <div className="relative flex flex-col items-center justify-center h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-black dark:via-gray-950 dark:to-black overflow-hidden transition-all duration-300">
        {/* Efectos cinematográficos */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent"></div>
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-500/10 to-transparent blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-full h-96 bg-gradient-to-t from-purple-500/10 to-transparent blur-3xl"></div>
        
        {/* Contenedor del video con sombra cinematográfica */}
        <div className="relative z-10 w-full max-w-6xl px-8 animate-scale-in">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/60 border border-white/10">
            <video controls className="w-full max-h-[calc(100vh-100px)] rounded-xl" autoPlay>
              <source src={url} type={`video/${format}`} />
              Tu navegador no soporta este video.
            </video>
          </div>
        </div>
        
        {/* Info del video */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 px-6 py-3 bg-black/60 backdrop-blur-xl rounded-full border border-white/10 shadow-2xl animate-fade-in-up">
          <div className="flex items-center gap-2">
            <Video size={16} className="text-blue-400" />
            <span className="text-sm font-medium text-white max-w-md truncate">{name}</span>
          </div>
        </div>
      </div>
    );
  }

  // --- 5. DOCUMENTOS DE OFFICE (Word, Excel, PPT) ---
  if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(format)) {
    const googleDocsUrl = `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;
    
    // Íconos y colores específicos por tipo
    const docTypes = {
      doc: { icon: FileText, color: 'blue', name: 'Word' },
      docx: { icon: FileText, color: 'blue', name: 'Word' },
      xls: { icon: FileText, color: 'green', name: 'Excel' },
      xlsx: { icon: FileText, color: 'green', name: 'Excel' },
      ppt: { icon: FileText, color: 'orange', name: 'PowerPoint' },
      pptx: { icon: FileText, color: 'orange', name: 'PowerPoint' }
    };
    
    const docInfo = docTypes[format] || { icon: FileText, color: 'gray', name: 'Documento' };
    const Icon = docInfo.icon;
    
    return (
      <div className="relative h-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-[#0a0a0f] dark:to-[#121218] transition-colors duration-300">
        {/* Barra superior elegante */}
        <div className="absolute top-0 left-0 right-0 z-10 px-6 py-4 bg-white/90 dark:bg-black/70 backdrop-blur-xl border-b border-slate-200 dark:border-white/10 shadow-lg">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 bg-${docInfo.color}-500/10 dark:bg-${docInfo.color}-500/20 rounded-xl`}>
              <Icon size={22} className={`text-${docInfo.color}-600 dark:text-${docInfo.color}-400`} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">{name}</h3>
              <p className="text-xs text-slate-500 dark:text-gray-400">Documento {docInfo.name}</p>
            </div>
            <div className="ml-auto">
              <span className="text-xs px-3 py-1 bg-slate-200 dark:bg-gray-700 text-slate-600 dark:text-gray-300 rounded-full font-medium uppercase tracking-wide">
                {format}
              </span>
            </div>
          </div>
        </div>
        
        <iframe 
          src={googleDocsUrl} 
          className="w-full h-full border-none pt-16" 
          title={name}
        />
      </div>
    );
  }

  // --- 6. FALLBACK (Archivos desconocidos o ZIPs) ---
  return (
    <div className="relative flex flex-col items-center justify-center h-full bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-[#0a0a0f] dark:via-[#121218] dark:to-[#1a1a24] p-8 text-center overflow-hidden transition-all duration-300">
      {/* Efectos de fondo */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-500/5 via-transparent to-slate-500/5 dark:from-gray-500/10 dark:to-slate-500/10"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-gray-500/10 dark:bg-gray-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-slate-500/10 dark:bg-slate-500/5 rounded-full blur-3xl"></div>
      
      <div className="relative z-10 max-w-lg animate-scale-in">
        {/* Ícono principal con efecto */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-500 to-slate-500 dark:from-gray-600 dark:to-slate-600 rounded-full blur-2xl opacity-30 animate-pulse-subtle"></div>
          <div className="relative w-32 h-32 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-gray-800 dark:to-gray-700 rounded-3xl flex items-center justify-center shadow-2xl border-4 border-white/50 dark:border-white/10 mx-auto">
            <File size={56} className="text-slate-600 dark:text-gray-300" strokeWidth={1.5} />
          </div>
        </div>
        
        {/* Información del archivo */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">Vista previa no disponible</h3>
          <p className="text-base text-slate-600 dark:text-gray-400 mb-4 leading-relaxed">
            El formato <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-200 dark:bg-gray-700 text-slate-800 dark:text-white rounded-lg font-bold text-sm">.{format}</span> no se puede visualizar aquí.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-gray-500">
            <Sparkles size={14} />
            <span>Descarga el archivo para abrirlo</span>
          </div>
        </div>
        
        {/* Botón de descarga mejorado */}
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-purple-600 hover:from-blue-600 hover:to-blue-700 dark:hover:from-blue-700 dark:hover:to-purple-700 rounded-xl font-bold text-white transition-all shadow-xl hover:shadow-2xl hover:shadow-blue-500/30 hover:scale-105 active:scale-95"
        >
          <Download size={20} className="group-hover:animate-bounce" />
          <span>Descargar Archivo</span>
        </a>
        
        {/* Info adicional */}
        <div className="mt-8 p-4 bg-white/50 dark:bg-black/20 backdrop-blur-xl rounded-xl border border-slate-200 dark:border-white/10">
          <p className="text-xs text-slate-600 dark:text-gray-400 font-medium">
            📁 <strong className="text-slate-800 dark:text-white">{name}</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default FileViewer;