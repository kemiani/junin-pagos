'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { EmailComposer, type EmailData } from '@/components/admin/emails/EmailComposer';

export default function ComposeEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sending, setSending] = useState(false);

  // Get initial values from URL params (for reply or forward)
  const initialTo = searchParams.get('to') || '';
  const initialSubject = searchParams.get('subject') || '';
  const initialLeadId = searchParams.get('lead_id')
    ? parseInt(searchParams.get('lead_id')!)
    : undefined;

  const handleSend = async (data: EmailData) => {
    setSending(true);
    try {
      const response = await fetch('/api/admin/emails/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...data,
          save_as_draft: false,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Mostrar notificación de éxito
        alert('Email enviado correctamente');
        router.push('/admin/emails');
      } else {
        alert(`Error: ${result.error || 'No se pudo enviar el email'}`);
      }
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Error al enviar el email');
    } finally {
      setSending(false);
    }
  };

  const handleSaveDraft = async (data: EmailData) => {
    setSending(true);
    try {
      const response = await fetch('/api/admin/emails/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...data,
          save_as_draft: true,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert('Borrador guardado');
        router.push('/admin/emails?folder=drafts');
      } else {
        alert(`Error: ${result.error || 'No se pudo guardar el borrador'}`);
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      alert('Error al guardar el borrador');
    } finally {
      setSending(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/emails');
  };

  return (
    <div className="h-[calc(100vh-180px)]">
      <EmailComposer
        initialTo={initialTo}
        initialLeadId={initialLeadId}
        initialSubject={initialSubject}
        onSend={handleSend}
        onSaveDraft={handleSaveDraft}
        onCancel={handleCancel}
        sending={sending}
      />
    </div>
  );
}
