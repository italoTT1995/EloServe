import React from 'react';

interface EloGastroLogoProps {
  variant?: 'horizontal' | 'vertical' | 'icon-only';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  theme?: 'dark' | 'light' | 'auto';
  showTagline?: boolean;
  className?: string;
}

/**
 * Ícone Oficial da Cloche com o loop fluido
 * Extraído diretamente da nova identidade visual oficial do eloGastrô
 */
export function EloGastroClocheIcon({
  size = 36,
  className = '',
}: {
  size?: number | string;
  color?: string;
  className?: string;
}) {
  const numericSize = typeof size === 'number' ? size : parseInt(size as string, 10) || 36;

  return (
    <img
      src="/images/elogastro-cloche.png"
      alt="Cloche eloGastrô"
      className={`shrink-0 object-contain select-none ${className}`}
      style={{
        width: `${numericSize}px`,
        height: `${Math.round(numericSize * 0.64)}px`,
      }}
      loading="eager"
    />
  );
}

/**
 * Logotipo Completo Oficial do eloGastrô
 * Aplica a nova imagem enviada: Cloche com laço + tipografia "elo" (laranja cursivo) "Gastr" (branco/escuro) "ô" (laranja com circunflexo)
 */
export function EloGastroLogo({
  variant = 'horizontal',
  size = 'md',
  theme = 'auto',
  showTagline = false,
  className = '',
}: EloGastroLogoProps) {
  const sizeMap = {
    xs: { icon: 24, text: 'text-sm', sub: 'text-[8px]', gap: 'gap-1.5', fullHeight: 36 },
    sm: { icon: 30, text: 'text-base', sub: 'text-[9px]', gap: 'gap-2', fullHeight: 46 },
    md: { icon: 40, text: 'text-xl', sub: 'text-[10px]', gap: 'gap-2.5', fullHeight: 64 },
    lg: { icon: 54, text: 'text-2xl', sub: 'text-xs', gap: 'gap-3', fullHeight: 88 },
    xl: { icon: 74, text: 'text-4xl', sub: 'text-sm', gap: 'gap-4', fullHeight: 120 },
  };

  const currentSize = sizeMap[size];

  // Se variant for 'icon-only', renderiza apenas a cloche
  if (variant === 'icon-only') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <EloGastroClocheIcon size={currentSize.icon} />
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
        <img
          src="/images/elogastro-logo-transparent.png"
          alt="eloGastrô"
          className="object-contain select-none"
          style={{
            height: `${currentSize.fullHeight}px`,
            width: 'auto',
          }}
          loading="eager"
        />
        {showTagline && (
          <p className={`mt-1 font-medium ${currentSize.sub} ${subDarkClass} tracking-wide select-none`}>
            Gestão completa para o seu restaurante.
          </p>
        )}
      </div>
    );
  }

  // Horizontal (Default)
  return (
    <div className={`flex items-center ${currentSize.gap} ${className}`}>
      <EloGastroClocheIcon size={currentSize.icon} />
      <div className="flex flex-col justify-center leading-none">
        <div className="flex items-baseline tracking-tight leading-none">
          <span
            className="text-[#FF6B00] font-bold select-none"
            style={{
              fontFamily: "'Dancing Script', 'Brush Script MT', 'Caveat', cursive, sans-serif",
              fontSize: '1.24em',
              fontWeight: 900,
              letterSpacing: '-0.02em',
              marginRight: '2px',
              transform: 'translateY(-1px)',
              display: 'inline-block',
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
            Gastr
          </span>
          <span
            className="font-black text-[#FF6B00] tracking-tight select-none"
            style={{
              fontFamily: "'Plus Jakarta Sans', 'Outfit', sans-serif",
              letterSpacing: '-0.02em',
            }}
          >
            ô
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
