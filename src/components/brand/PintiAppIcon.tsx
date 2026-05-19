import { useState } from 'react'

interface PintiAppIconProps {
  className?: string
}

export function PintiAppIcon({ className = 'h-11 w-11' }: PintiAppIconProps) {
  const [imageFailed, setImageFailed] = useState(false)

  return (
    <span
      className={[
        'relative grid shrink-0 place-items-center overflow-hidden rounded-2xl border border-emerald-200/30 bg-emerald-200/[0.07] text-xl font-black text-emerald-100 shadow-[0_12px_32px_rgba(13,70,58,0.22),inset_0_1px_0_rgba(255,248,235,0.12)]',
        className,
      ].join(' ')}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(94,234,212,0.24),rgba(6,16,23,0)_62%)]"
      />
      {imageFailed ? (
        <span aria-hidden="true" className="relative z-10">
          P
        </span>
      ) : (
        <img
          src="/assets/pinti-app-icon.png"
          alt="Pinti logosu"
          width="44"
          height="44"
          decoding="async"
          onError={() => setImageFailed(true)}
          className="relative z-10 h-full w-full scale-[1.9] object-cover object-center brightness-110 contrast-110 saturate-105"
        />
      )}
    </span>
  )
}
