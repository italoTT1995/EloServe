import React from 'react';

interface EloGastroLogoProps {
  variant?: 'horizontal' | 'vertical' | 'icon-only';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  theme?: 'dark' | 'light' | 'auto';
  showTagline?: boolean;
  className?: string;
}

/**
 * Ícone Oficial da Cloche (Bandeja) com a linha fluida do "elo"
 * Extraído diretamente do Manual de Identidade Visual do eloGastrô
 */
export function EloGastroClocheIcon({
  size = 36,
  color = '#FF6B00',
  className = '',
}: {
  size?: number | string;
  color?: string;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-label="eloGastrô Cloche"
    >
      {/* Alça superior da cloche (anel) */}
      <circle cx="50" cy="12" r="7" stroke={color} strokeWidth="4" fill="none" />

      {/* Cúpula / Tampa da Cloche */}
      <path
        d="M14 54 C 14 26, 32 18, 50 18 C 68 18, 86 26, 86 54 Z"
        fill={color}
      />

      {/* Traço fluido em fita que desenha o "e" / "elo" dentro da cúpula */}
      <path
        d="M 16 50 C 28 50, 36 44, 42 36 C 47 28, 56 26, 56 36 C 56 45, 44 48, 40 45 C 36 42, 50 29, 64 36 C 72 41, 80 48, 84 50"
        stroke="#FFFFFF"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Base / Prato da cloche */}
      <rect
        x="10"
        y="58"
        width="80"
        height="5.5"
        rx="2.75"
        fill={color}
      />
    </svg>
  );
}

/**
 * Logotipo Completo do eloGastrô
 * Aplica as diretrizes oficiais de marca: Laranja #FF6B00, Azul Escuro #1E293B e Off White #F8FAFC
 */
export function EloGastroLogo({
  variant = 'horizontal',
  size = 'md',
  theme = 'auto',
  showTagline = false,
  className = '',
}: EloGastroLogoProps) {
  const sizeMap = {
    xs: { icon: 22, text: 'text-sm', sub: 'text-[8px]', gap: 'gap-1.5' },
    sm: { icon: 28, text: 'text-base', sub: 'text-[9px]', gap: 'gap-2' },
    md: { icon: 38, text: 'text-xl', sub: 'text-[10px]', gap: 'gap-2.5' },
    lg: { icon: 52, text: 'text-2xl', sub: 'text-xs', gap: 'gap-3' },
    xl: { icon: 72, text: 'text-4xl', sub: 'text-sm', gap: 'gap-4' },
  };

  const currentSize = sizeMap[size];

  // Se variant for 'icon-only', renderiza apenas a cloche
  if (variant === 'icon-only') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <EloGastroClocheIcon size={currentSize.icon} color="#FF6B00" />
      </div>
    );
  }

  // Estilo das cores de acordo com o tema
  const textDarkClass =
    theme === 'dark'
      ? 'text-white'
      : theme === 'light'
      ? 'text-[#1E293B]'
      : 'text-white dark:text-white';

  const subDarkClass =
    theme === 'dark'
      ? 'text-slate-400'
      : theme === 'light'
      ? 'text-slate-500'
      : 'text-slate-400';

  if (variant === 'vertical') {
    return (
      <div className={`flex flex-col items-center text-center ${currentSize.gap} ${className}`}>
        <EloGastroClocheIcon size={currentSize.icon * 1.3} color="#FF6B00" />
        <div className="flex flex-col items-center">
          <div className="flex items-baseline tracking-tight font-black leading-none">
            <span
              className="text-[#FF6B00] italic font-serif font-black mr-0.5"
              style={{
                fontFamily: "'Brush Script MT', 'Dancing Script', 'Caveat', cursive, sans-serif",
                fontSize: '1.25em',
                transform: 'translateY(-2px)',
                display: 'inline-block',
              }}
            >
              elo
            </span>
            <span className={`font-extrabold ${textDarkClass} tracking-tight`}>
              Gastrô
            </span>
          </div>
          {showTagline && (
            <p className={`mt-1 font-medium ${currentSize.sub} ${subDarkClass} tracking-wide`}>
              Gestão completa para o seu restaurante.
            </p>
          )}
        </div>
      </div>
    );
  }

  // Horizontal (Default)
  return (
    <div className={`flex items-center ${currentSize.gap} ${className}`}>
      <EloGastroClocheIcon size={currentSize.icon} color="#FF6B00" />
      <div className="flex flex-col justify-center leading-none">
        <div className="flex items-baseline tracking-tight leading-none">
          <span
            className="text-[#FF6B00] font-bold select-none"
            style={{
              fontFamily: "'Plus Jakarta Sans', 'Outfit', sans-serif",
              fontStyle: 'italic',
              fontWeight: 900,
              fontSize: '1.08em',
              letterSpacing: '-0.03em',
              marginRight: '1px',
            }}
          >
            elo
          </span>
          <span
            className={`font-black ${textDarkClass} tracking-tight select-none`}
            style={{
              fontFamily: "'Plus Jakarta Sans', 'Outfit', sans-serif",
              letterSpacing: '-0.02em',
            }}
          >
            Gastrô
          </span>
        </div>
        {showTagline && (
          <p className={`mt-1 font-medium ${currentSize.sub} ${subDarkClass} tracking-wide select-none`}>
            Gestão completa para o seu restaurante.
          </p>
        )}
      </div>
    </div>
  );
}

export default EloGastroLogo;
