'use client';

import { useState, FormEvent, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import AuthForm, { InputField, Checkbox } from '@/components/admin/AuthForm';

// Componente que usa searchParams (debe estar en Suspense)
function SessionMessage() {
  const searchParams = useSearchParams();
  const [sessionMessage, setSessionMessage] = useState<string | null>(null);

  useEffect(() => {
    const reason = searchParams.get('reason');
    if (reason === 'session_expired') {
      setSessionMessage('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
    } else if (reason === 'no_session') {
      setSessionMessage('Debes iniciar sesión para acceder al panel de administración.');
    }
  }, [searchParams]);

  if (!sessionMessage) return null;

  return (
    <div className="mb-4 flex items-center gap-3 px-4 py-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
      <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
      <p className="text-sm text-amber-200">{sessionMessage}</p>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!formData.email || !formData.password) {
        setError('Por favor complete todos los campos');
        setLoading(false);
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError('Por favor ingrese un email valido');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error al iniciar sesion');
        setLoading(false);
        return;
      }

      if (formData.rememberMe) {
        localStorage.setItem('junin-remember-email', formData.email);
      } else {
        localStorage.removeItem('junin-remember-email');
      }

      router.push('/admin');
      router.refresh();
    } catch (err) {
      console.error('Login error:', err);
      setError('Error de conexion. Verifique su conexion a internet.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950">
      <div className="w-full max-w-md">
        {/* Mensaje de sesión expirada */}
        <Suspense fallback={null}>
          <SessionMessage />
        </Suspense>

        <AuthForm
          title="Iniciar Sesion"
          subtitle="Panel de administracion"
          onSubmit={handleSubmit}
          loading={loading}
          error={error}
          submitText="INICIAR SESION"
        >
          <InputField
            name="email"
            type="email"
            placeholder="correo@ejemplo.com"
            icon={<Mail size={20} />}
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
          />

          <InputField
            name="password"
            type="password"
            placeholder="Contrasena"
            icon={<Lock size={20} />}
            value={formData.password}
            onChange={handleChange}
            showPasswordToggle
            onTogglePassword={() => setShowPassword(!showPassword)}
            showPassword={showPassword}
            autoComplete="current-password"
          />

          <Checkbox
            name="rememberMe"
            checked={formData.rememberMe}
            onChange={handleChange}
            label="Recordarme"
          />
        </AuthForm>

        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500">
            Sitio protegido con encriptacion de grado empresarial
          </p>
        </div>
      </div>
    </div>
  );
}
