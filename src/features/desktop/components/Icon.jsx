// src/features/desktop/components/Icon.jsx
import React, { memo, useRef, useState, useEffect } from 'react';
import Draggable from 'react-draggable';

const Icon = ({ nombre, imgSrc, iconData, onOpen, onContextMenu, onMove, onRename }) => {
  const nodeRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  // const [newName, setNewName] = useState(nombre);
  const [draftName, setDraftName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const clickTimer = useRef(null);

  const isSystemApp = iconData._id.toString().startsWith('sys-');

  // useEffect(() => {
  //   setNewName(nombre);
  // }, [nombre]);

  const handleStart = (e, data) => {
    setDragStartPos({ x: data.x, y: data.y });
    setTimeout(() => setIsDragging(true), 50);
  };

  const handleStop = (e, data) => {
    setIsDragging(false);
    if (isEditing || isSystemApp) return;

    const finalX = Math.round(data.x);
    const finalY = Math.round(data.y);

    const diffX = Math.abs(finalX - dragStartPos.x);
    const diffY = Math.abs(finalY - dragStartPos.y);

    if (diffX < 8 && diffY < 8) return;

    if (onMove) {
      onMove(iconData._id, finalX, finalY);
    }
  };

  const handleClick = (e) => {
    e.stopPropagation();
    if (isEditing || isDragging) return;

    setClickCount(prev => prev + 1);

    if (clickTimer.current) {
      clearTimeout(clickTimer.current);
    }

    clickTimer.current = setTimeout(() => {
      if (clickCount + 1 >= 2) {
        if (iconData?.type === 'link' && iconData.url) {
          window.open(iconData.url, '_blank', 'noopener,noreferrer');
        } else if (onOpen) {
          onOpen(iconData.appId || iconData.type, nombre, iconData.windowOptions, iconData);
        }
      }
      setClickCount(0);
    }, 300);
  };

  const submitRename = () => {
    setIsEditing(false);
    if (draftName.trim() !== "" && draftName !== nombre) {
      onRename(iconData._id, draftName.trim());
    }
  };

  return (
    <Draggable
      nodeRef={nodeRef}
      disabled={isEditing || isSystemApp}
      position={{ 
        x: Math.round(iconData.position?.x || 0), 
        y: Math.round(iconData.position?.y || 0) 
      }}
      onStart={handleStart}
      onStop={handleStop}
    >
      <div 
        ref={nodeRef} 
        className={`absolute w-[80px] h-[95px] flex flex-col items-center justify-start p-2
                   rounded-[10px] select-none
                   ${isDragging ? 'z-50' : 'z-10'}
                   ${isSystemApp ? 'cursor-default' : 'cursor-pointer'}`}
        style={{ 
          transition: isDragging ? 'none' : 'all 0.15s cubic-bezier(0.2, 0, 0, 1)',
          transform: isDragging ? 'scale(1.05)' : 'scale(1)',
          ...(isDragging ? { willChange: 'transform' } : {}),
          backgroundColor: isEditing
            ? 'rgba(255, 255, 255, 0.12)' 
            : isHovered && !isDragging 
              ? 'rgba(255, 255, 255, 0.08)' 
              : 'transparent',
          backdropFilter: (isHovered || isEditing) && !isDragging ? 'blur(12px) saturate(1.5)' : 'none',
          WebkitBackdropFilter: (isHovered || isEditing) && !isDragging ? 'blur(12px) saturate(1.5)' : 'none',
          border: isEditing 
            ? '1px solid rgba(99, 179, 237, 0.4)' 
            : isHovered && !isDragging 
              ? '1px solid rgba(255, 255, 255, 0.1)' 
              : '1px solid transparent',
          boxShadow: isDragging 
            ? '0 12px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)' 
            : isHovered && !isDragging 
              ? '0 4px 16px rgba(0, 0, 0, 0.15)' 
              : 'none',
          WebkitFontSmoothing: 'subpixel-antialiased',
          backfaceVisibility: 'hidden',
          perspective: '1000px'
        }}
        onClick={handleClick}
        onContextMenu={(e) => onContextMenu && onContextMenu(e, iconData)}
        onMouseEnter={() => !isDragging && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Contenedor del Icono - Reduje el margin-bottom de 2 a 1 para ganar espacio de texto */}
        <div 
          className="relative mb-1 flex items-center justify-center"
          style={{
            width: '48px',
            height: '48px',
            transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
            transform: isHovered && !isDragging ? 'scale(1.08) translateY(-2px)' : 'scale(1)',
          }}
        >
          <img 
            src={imgSrc} 
            alt={nombre} 
            className="pointer-events-none"
            style={{
              width: '44px', // Reducido un poquito para evitar que toque los bordes
              height: '44px',
              filter: isDragging 
                ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' 
                : 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
              imageRendering: 'crisp-edges'
            }}
            draggable="false"
          />
        </div>
        
        {/* Nombre del Ícono - Ajustado para ser más nítido y presente */}
        <div className="w-full flex items-start justify-center" style={{ height: '38px', paddingTop: '2px' }}>
          {isEditing ? (
            <input
              autoFocus
              className="w-full text-white text-[11px] text-center outline-none rounded-md px-1 py-0.5"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                border: '1.5px solid rgba(99, 179, 237, 0.8)',
                fontFamily: 'Inter, system-ui, sans-serif',
                fontWeight: '500'
              }}
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              onBlur={submitRename}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submitRename();
                if (e.key === 'Escape') setIsEditing(false);
              }}
            />
          ) : (
            <p 
              className="text-white text-center leading-[1.2] w-full px-0.5"
              style={{
                fontSize: '11px', // Aumentado de 10px a 11px
                fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                fontWeight: '500',
                letterSpacing: '0.015em',
                // Sombra más fuerte para evitar que "desaparezca" en fondos claros
                textShadow: '0 1px 2px rgba(0,0,0,0.9), 0 0 5px rgba(0,0,0,0.5)',
                opacity: 1,
                display: '-webkit-box',
                WebkitLineClamp: '2',
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                wordBreak: 'break-word'
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (!isSystemApp && !isDragging) {
                  setDraftName(nombre);
                  setIsEditing(true);
                }
              }}
            >
              {nombre}
            </p>
          )}
        </div>
      </div>
    </Draggable>
  );
};

export default memo(Icon);