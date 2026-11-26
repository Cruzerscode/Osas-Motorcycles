import React, { useEffect, useRef, useState } from 'react';
import { Eye, EyeOff, Heart, Lock, ShieldCheck, X } from 'lucide-react';

interface AdminAuthModalProps {
  open: boolean;
  expectedPin: string;
  cloudUserEmail?: string | null;
  isCloudAdmin?: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onGoogleSignIn?: () => Promise<{ ok: boolean; error?: string }>;
  onOpenCustomerGarage: () => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  open,
  expectedPin,
  cloudUserEmail,
  isCloudAdmin,
  onClose,
  onSuccess,
  onGoogleSignIn,
  onOpenCustomerGarage,
}) => {
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setPin('');
      setError('');
      setShowPin(false);
      setGoogleLoading(false);
      const timer = window.setTimeout(() => {
        inputRef.current?.focus();
      }, 40);
      return () => window.clearTimeout(timer);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.trim() === expectedPin.trim()) {
      setError('');
      onSuccess();
    } else {
      setError('Incorrect dealer PIN. Please try again.');
    }
  };

  const handleGoogleClick = async () => {
    if (!onGoogleSignIn) return;
    setError('');
    setGoogleLoading(true);
    try {
      const res = await onGoogleSignIn();
      if (res.ok) {
        onSuccess();
      } else if (res.error) {
        setError(res.error);
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/45 backdrop-blur-[2px]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Dealer Admin Portal Login"
    >
      <div
        className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 sm:p-7 shadow-2xl border border-black/[0.06] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="w-10 h-1 bg-zinc-300 rounded-full mx-auto mb-3 sm:hidden"
          aria-hidden="true"
        />
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-[#F3F3F5] text-[#DC2626] shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#DC2626]">
                Osas Motorcycle Management
              </p>
              <h2 className="text-[20px] font-bold text-[#18181B] leading-tight">
                Dealer Admin Portal
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dealer login"
            className="w-9 h-9 rounded-full bg-[#F3F3F5] hover:bg-zinc-200 inline-flex items-center justify-center text-[#18181B] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="mt-4 text-[13.5px] text-[#71717A] leading-relaxed">
          Sign in with your authorized Google dealer account to sync inventory,
          3D <span className="font-mono text-[#18181B]">.glb</span> models,
          spare parts, and customer orders with the live database.
        </p>

        {onGoogleSignIn && (
          <div className="mt-4">
            {isCloudAdmin ? (
              <button
                type="button"
                onClick={onSuccess}
                className="w-full py-3.5 px-4 rounded-full bg-[#DC2626] hover:bg-red-700 text-white text-[13.5px] font-semibold transition-colors cursor-pointer"
              >
                Continue as {cloudUserEmail || 'Cloud Admin'}
              </button>
            ) : (
              <button
                type="button"
                disabled={googleLoading}
                onClick={handleGoogleClick}
                className="w-full py-3 px-4 rounded-full bg-white hover:bg-[#F3F3F5] border border-zinc-200 text-[#18181B] text-[13.5px] font-semibold inline-flex items-center justify-center gap-2.5 transition-colors cursor-pointer disabled:opacity-60"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
                  />
                </svg>
                <span>
                  {googleLoading
                    ? 'Verifying Dealer Account...'
                    : 'Sign in with Google (Cloud Admin)'}
                </span>
              </button>
            )}
          </div>
        )}

        <div className="my-4 flex items-center gap-3 text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
          <div className="h-px flex-1 bg-zinc-200" />
          <span>or showroom pin</span>
          <div className="h-px flex-1 bg-zinc-200" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="dealer-pin-input"
              className="block text-[12px] font-semibold text-[#18181B] mb-1.5"
            >
              Passcode PIN
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={inputRef}
                id="dealer-pin-input"
                type={showPin ? 'text' : 'password'}
                inputMode="numeric"
                autoComplete="off"
                required
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Enter PIN (default: 1234)"
                className="w-full h-12 pl-11 pr-11 rounded-2xl bg-[#F3F3F5] border border-zinc-200/80 text-[15px] font-semibold tracking-widest text-[#18181B] placeholder:tracking-normal placeholder:font-normal placeholder:text-zinc-400 focus:outline-none focus:border-[#18181B] focus:ring-2 focus:ring-[#18181B]/10"
              />
              <button
                type="button"
                onClick={() => setShowPin((prev) => !prev)}
                aria-label={showPin ? 'Hide PIN' : 'Show PIN'}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full hover:bg-zinc-200/70 inline-flex items-center justify-center text-zinc-500 cursor-pointer"
              >
                {showPin ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {error && (
              <p className="mt-2 text-[12.5px] font-semibold text-[#DC2626]">
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-full bg-[#18181B] hover:bg-[#DC2626] text-white text-[14px] font-semibold transition-colors shadow-[0_8px_20px_rgba(24,24,27,0.16)] cursor-pointer"
          >
            Unlock Admin Dashboard
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-zinc-100 flex items-center justify-between gap-3">
          <span className="text-[11.5px] text-zinc-400">
            Showroom PIN:{' '}
            <span className="font-mono font-semibold text-zinc-600">1234</span>
          </span>
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenCustomerGarage();
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#F3F3F5] hover:bg-zinc-200/80 text-[12px] font-semibold text-[#18181B] transition-colors cursor-pointer"
          >
            <Heart className="w-3.5 h-3.5 text-[#DC2626]" />
            <span>Customer Garage</span>
          </button>
        </div>
      </div>
    </div>
  );
};
