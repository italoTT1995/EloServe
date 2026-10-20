import React, { useState, useEffect, useRef } from 'react';

interface DoubleClickButtonProps {
  onConfirm: () => void;
  labelDefault: string;
  labelConfirm?: string;
  iconDefault?: React.ReactNode;
  iconConfirm?: React.ReactNode;
  className?: string;
  classNameConfirm?: string;
  title?: string;
  timeoutMs?: number;
  disabled?: boolean;
}

export function DoubleClickButton({
  onConfirm,
  labelDefault,
  labelConfirm = 'Dê +1 clique p/ confirmar',
  iconDefault,
  iconConfirm,
  className = '',
  classNameConfirm = 'bg-amber-400 text-slate-950 font-black ring-2 ring-amber-300 shadow-lg shadow-amber-400/30 animate-pulse',
  title = 'Dê 2 cliques para confirmar esta ação',
  timeoutMs = 2200,
  disabled = false,
}: DoubleClickButtonProps) {
  const [confirming, setConfirming] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  function handleTrigger(e?: React.MouseEvent) {
    if (e) {
      e.stopPropagation();
    }
    if (disabled) return;

    if (confirming) {
      // 2º clique confirmado!
      if (timerRef.current) clearTimeout(timerRef.current);
      setConfirming(false);
      onConfirm();
    } else {
      // 1º clique: inicia janela de confirmação de 2 cliques
      setConfirming(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setConfirming(false);
      }, timeoutMs);
    }
  }

  function handleNativeDoubleClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (disabled) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    setConfirming(false);
    onConfirm();
  }

  return (
    <button
      type="button"
      onClick={handleTrigger}
      onDoubleClick={handleNativeDoubleClick}
      disabled={disabled}
      title={title}
      className={`select-none cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1.5 ${
        confirming ? classNameConfirm : className
      }`}
    >
      {confirming ? (
        <>
          {iconConfirm || iconDefault}
          <span>{labelConfirm}</span>
        </>
      ) : (
        <>
          {iconDefault}
          <span>{labelDefault}</span>
        </>
      )}
    </button>
  );
}
