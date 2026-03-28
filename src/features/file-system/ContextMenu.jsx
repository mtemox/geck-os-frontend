// src/features/file-system/ContextMenu.jsx
import React from 'react';
import { Trash2, Link as LinkIcon, FolderPlus, FileText, FileCode, Share2, UploadCloud } from 'lucide-react';

function ContextMenu({ isVisible, x, y, onNewLink, onNewFolder, onNewNote, onNewCode, onUploadFile, selectedItem, onDelete, onShare }) {
  
  if (!isVisible) return null;

  return (
    <div 
      className="
                  absolute z-[9999] w-56 rounded-lg py-1.5 overflow-hidden animate-scale-in
                  bg-white/95 dark:bg-[#1a1a1a]/95 
                  backdrop-blur-xl 
                  border border-slate-200 dark:border-white/10 
                  shadow-xl 
                  shadow-black/10 dark:shadow-black/50
                  text-slate-700 dark:text-gray-200
                  transition-colors duration-300
              "
      style={{ top: `${y}px`, left: `${x}px` }}
    >
      <ul className="py-1">
        
        {/* Nueva Carpeta */}
        <li 
           className="
                        flex items-center gap-2 px-4 py-2 text-sm cursor-pointer 
                        text-slate-700 dark:text-gray-200
                        hover:bg-blue-500 hover:text-white
                        dark:hover:bg-blue-600 dark:hover:text-white
                        transition-colors duration-150
                    "
           onClick={onNewFolder}
        >
           <FolderPlus size={14} /> Nueva Carpeta
        </li>

        {/* Archivo */}
        
        {!selectedItem && (
            <li 
            className="
                            flex items-center gap-2 px-4 py-2 text-sm cursor-pointer 
                            text-slate-700 dark:text-gray-200
                            hover:bg-blue-500 hover:text-white
                            dark:hover:bg-blue-600 dark:hover:text-white
                            transition-colors duration-150
                        "
            onClick={onUploadFile} // 👈 Llama a la función
            >
            <UploadCloud size={14} /> Subir Archivo
            </li>
        )}

        {/* Nueva Nota */}
        <li 
           className="
                      flex items-center gap-2 px-4 py-2 text-sm cursor-pointer
                      text-slate-700 dark:text-gray-200
                      hover:bg-blue-500 hover:text-white
                      dark:hover:bg-blue-600 dark:hover:text-white
                      transition-colors duration-150
                  "
           onClick={onNewNote}
        >
           <FileText size={14} /> Nueva Nota
        </li>

        {/* Nuevo Código */}
        <li 
           className="
                      flex items-center gap-2 px-4 py-2 text-sm cursor-pointer
                      text-slate-700 dark:text-gray-200
                      hover:bg-blue-500 hover:text-white
                      dark:hover:bg-blue-600 dark:hover:text-white
                      transition-colors duration-150
                  "
           onClick={onNewCode}
        >
           <FileCode size={14} /> Nuevo Código
        </li>
        
        {/* Nuevo Enlace */}
        <li 
          className="
                      flex items-center gap-2 px-4 py-2 text-sm cursor-pointer
                      text-slate-700 dark:text-gray-200
                      hover:bg-blue-500 hover:text-white
                      dark:hover:bg-blue-600 dark:hover:text-white
                      transition-colors duration-150
                  "
          onClick={onNewLink}
        >
          <LinkIcon size={14} /> Nuevo Enlace
        </li>

        {/* Separador */}
        <div className="border-t border-slate-200 dark:border-white/10 my-1"></div>

        {/* Opciones ESPECÍFICAS DE ÍTEM */}
        {selectedItem && (
            <>
                <li className="
                              px-4 py-2 text-xs 
                              text-slate-500 dark:text-gray-500 
                              font-bold uppercase
                            ">
                    {selectedItem.nombre}
                </li>

                {/* Compartir */}
                <li 
                    className="
                                  flex items-center gap-2 px-4 py-2 text-sm cursor-pointer
                                  text-slate-700 dark:text-gray-200
                                  hover:bg-blue-500 hover:text-white
                                  dark:hover:bg-blue-600 dark:hover:text-white
                                  transition-colors duration-150
                              "
                    onClick={onShare}
                >
                    <Share2 size={14} className="text-blue-500 dark:text-blue-400" /> Compartir
                </li>
                
                {/* Eliminar */}
                <li 
                    className="
                              flex items-center gap-2 px-4 py-2 text-sm cursor-pointer
                              text-red-500 dark:text-red-400
                              hover:bg-red-500/20 dark:hover:bg-red-500/30 
                              hover:text-red-600 dark:hover:text-red-300
                              transition-colors duration-150
                            "
                    onClick={() => onDelete(selectedItem)}
                >
                    <Trash2 size={14} /> Eliminar
                </li>
            </>
        )}

        {!selectedItem && (
             <li className="
                          px-4 py-2 text-sm cursor-pointer
                          text-slate-700 dark:text-gray-200
                          hover:bg-slate-100 dark:hover:bg-white/10
                          transition-colors duration-150
                        ">
                Propiedades
            </li>
        )}

      </ul>
    </div>
  );
}

export default ContextMenu;