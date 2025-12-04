'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock } from 'lucide-react';
import AuthForm, { InputField, Checkbox } from '@/components/admin/AuthForm';

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
