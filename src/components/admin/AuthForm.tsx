'use client';

import { ReactNode } from 'react';
import { Eye, EyeOff, Shield } from 'lucide-react';

interface InputFieldProps {
  name: string;
  type: string;
  placeholder: string;
  icon: ReactNode;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showPasswordToggle?: boolean;
  onTogglePassword?: () => void;
  showPassword?: boolean;
  autoComplete?: string;
}

export function InputField({
  name,
  type,
  placeholder,
  icon,
  value,
  onChange,
  showPasswordToggle,
  onTogglePassword,
  showPassword,
  autoComplete = 'off'
}: InputFieldProps) {
  return (
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>
      <input
        name={name}
        type={showPasswordToggle ? (showPassword ? 'text' : 'password') : type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        className="w-full h-12 pl-12 pr-12 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 rounded-lg"
      />
      {showPasswordToggle && (
        <button
          type="button"
          onClick={onTogglePassword}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-400 transition-colors"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      )}
    </div>
  );
}

interface AuthFormProps {
  title: string;
  subtitle: string;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  error: string | null;
  children: ReactNode;
  submitText: string;
}

export default function AuthForm({
  title,
  subtitle,
  onSubmit,
  loading,
  error,
  children,
  submitText,
}: AuthFormProps) {
  return (
    <div className="bg-slate-900 rounded-2xl p-8 shadow-2xl border border-slate-800">
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center">
          <Shield className="text-white" size={32} />
        </div>
      </div>

      <h2 className="text-2xl font-bold text-white text-center mb-2">{title}</h2>
      <p className="text-slate-400 text-center mb-6">{subtitle}</p>

      {error && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
          <p className="text-red-400 text-sm font-medium text-center">{error}</p>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        {children}

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Procesando...
            </>
          ) : (
            submitText
          )}
        </button>
      </form>
    </div>
  );
}

interface CheckboxProps {
  name: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
}

export function Checkbox({ name, checked, onChange, label }: CheckboxProps) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        className="w-5 h-5 text-cyan-500 bg-slate-800 border-slate-600 rounded focus:ring-cyan-500 focus:ring-2 cursor-pointer"
      />
      <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
        {label}
      </span>
    </label>
  );
}
