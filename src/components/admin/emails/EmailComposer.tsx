'use client';

import { useState, useEffect } from 'react';
import {
  Send,
  Save,
  X,
  ChevronDown,
  User,
  FileText,
  Loader2,
  AtSign,
} from 'lucide-react';
import type { EmailTemplate, EmailAccount } from '@/types/email';

interface Lead {
  id: number;
  nombre: string;
  telefono: string;
  localidad: string;
}

interface EmailAccountWithPermissions extends EmailAccount {
  can_send: boolean;
  can_receive: boolean;
  is_owner: boolean;
}

interface EmailComposerProps {
  initialTo?: string;
  initialToName?: string;
  initialLeadId?: number;
  initialSubject?: string;
  initialBody?: string;
  initialFromAccountId?: string;
  onSend: (data: EmailData) => Promise<void>;
  onSaveDraft: (data: EmailData) => Promise<void>;
  onCancel: () => void;
  sending?: boolean;
}

export interface EmailData {
  to_email: string;
  to_name?: string;
  lead_id?: number;
  subject: string;
  body_html: string;
  body_text?: string;
  template_id?: string;
  variables?: Record<string, string>;
  from_account_id?: string;
  from_email?: string;
  from_name?: string;
}

export function EmailComposer({
  initialTo = '',
  initialToName = '',
  initialLeadId,
  initialSubject = '',
  initialBody = '',
  initialFromAccountId,
  onSend,
  onSaveDraft,
  onCancel,
  sending = false,
}: EmailComposerProps) {
  const [toEmail, setToEmail] = useState(initialTo);
  const [toName, setToName] = useState(initialToName);
  const [leadId, setLeadId] = useState<number | undefined>(initialLeadId);
  const [subject, setSubject] = useState(initialSubject);
  const [bodyHtml, setBodyHtml] = useState(initialBody);
  const [showLeadPicker, setShowLeadPicker] = useState(false);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [emailAccounts, setEmailAccounts] = useState<EmailAccountWithPermissions[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<EmailAccountWithPermissions | null>(null);
  const [leadSearch, setLeadSearch] = useState('');
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);

  // Fetch email accounts
  useEffect(() => {
    const fetchAccounts = async () => {
      setLoadingAccounts(true);
      try {
        const response = await fetch('/api/admin/emails/accounts', {
          credentials: 'include',
        });
        const data = await response.json();
        if (data.success && data.data) {
          const accounts = data.data.filter((a: EmailAccountWithPermissions) => a.can_send);
          setEmailAccounts(accounts);

          // Seleccionar cuenta inicial
          if (initialFromAccountId) {
            const initial = accounts.find((a: EmailAccountWithPermissions) => a.id === initialFromAccountId);
            if (initial) setSelectedAccount(initial);
          } else {
            // Buscar cuenta por defecto o la primera disponible
            const defaultAccount = accounts.find((a: EmailAccountWithPermissions) => a.is_default) || accounts[0];
            if (defaultAccount) setSelectedAccount(defaultAccount);
          }
        }
      } catch (error) {
        console.error('Error fetching email accounts:', error);
      } finally {
        setLoadingAccounts(false);
      }
    };

    fetchAccounts();
  }, [initialFromAccountId]);

  // Fetch leads
  useEffect(() => {
    const fetchLeads = async () => {
      setLoadingLeads(true);
      try {
        const response = await fetch('/api/admin/leads/list?limit=100', {
          credentials: 'include',
        });
        const data = await response.json();
        if (data.success) {
          setLeads(data.data);
        }
      } catch (error) {
        console.error('Error fetching leads:', error);
      } finally {
        setLoadingLeads(false);
      }
    };

    fetchLeads();
  }, []);

  // Fetch templates
  useEffect(() => {
    const fetchTemplates = async () => {
      setLoadingTemplates(true);
      try {
        const response = await fetch('/api/admin/emails/templates', {
          credentials: 'include',
        });
        const data = await response.json();
        if (data.success) {
          setTemplates(data.data);
        }
      } catch (error) {
        console.error('Error fetching templates:', error);
      } finally {
        setLoadingTemplates(false);
      }
    };

    fetchTemplates();
  }, []);

  // Filter leads by search
  const filteredLeads = leads.filter((lead) =>
    lead.nombre.toLowerCase().includes(leadSearch.toLowerCase()) ||
    lead.telefono.includes(leadSearch)
  );

  // Select lead
  const handleSelectLead = (lead: Lead) => {
    // Generar email ficticio basado en nombre si no existe
    const email = `${lead.nombre.toLowerCase().replace(/\s+/g, '.')}@cliente.com`;
    setToEmail(email);
    setToName(lead.nombre);
    setLeadId(lead.id);
    setShowLeadPicker(false);
    setLeadSearch('');

    // Si hay template seleccionado, reemplazar variables
    if (selectedTemplate) {
      applyTemplate(selectedTemplate, lead.nombre);
    }
  };

  // Apply template
  const applyTemplate = (template: EmailTemplate, nombre?: string) => {
    let newSubject = template.subject;
    let newBody = template.body_html;
    const leadName = nombre || toName || 'Cliente';

    // Reemplazar variables
    newSubject = newSubject.replace(/\{\{nombre\}\}/g, leadName);
    newBody = newBody.replace(/\{\{nombre\}\}/g, leadName);

    setSubject(newSubject);
    setBodyHtml(newBody);
    setSelectedTemplate(template);
    setShowTemplatePicker(false);
  };

  // Handle send
  const handleSend = async () => {
    if (!toEmail || !subject || !bodyHtml) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    if (!selectedAccount) {
      alert('Por favor selecciona una cuenta de envío');
      return;
    }

    await onSend({
      to_email: toEmail,
      to_name: toName || undefined,
      lead_id: leadId,
      subject,
      body_html: bodyHtml,
      template_id: selectedTemplate?.id,
      from_account_id: selectedAccount.id,
      from_email: selectedAccount.email,
      from_name: selectedAccount.name,
    });
  };

  // Handle save draft
  const handleSaveDraft = async () => {
    if (!subject && !bodyHtml) {
      alert('El borrador debe tener al menos un asunto o contenido');
      return;
    }

    await onSaveDraft({
      to_email: toEmail || 'borrador@temp.com',
      to_name: toName || undefined,
      lead_id: leadId,
      subject: subject || '(Sin asunto)',
      body_html: bodyHtml || '<p></p>',
    });
  };

  // Convert HTML to plain text for preview
  const stripHtml = (html: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
        <h2 className="text-lg font-semibold text-white">Nuevo Email</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveDraft}
            disabled={sending}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span className="hidden sm:inline">Guardar borrador</span>
          </button>
          <button
            onClick={onCancel}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* From Field - Selector de cuenta */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">De:</label>
            <div className="relative">
              <button
                onClick={() => setShowFromPicker(!showFromPicker)}
                disabled={loadingAccounts || emailAccounts.length === 0}
                className="w-full flex items-center justify-between px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-left hover:border-slate-600 transition-colors disabled:opacity-50"
              >
                <div className="flex items-center gap-2">
                  <AtSign className="w-4 h-4 text-cyan-500" />
                  {loadingAccounts ? (
                    <span className="text-slate-500">Cargando cuentas...</span>
                  ) : selectedAccount ? (
                    <div>
                      <span className="text-white">{selectedAccount.name}</span>
                      <span className="text-slate-400 ml-2 text-sm">&lt;{selectedAccount.email}&gt;</span>
                      {selectedAccount.type === 'shared' && (
                        <span className="ml-2 text-xs bg-cyan-500/20 text-cyan-400 px-1.5 py-0.5 rounded">Compartida</span>
                      )}
                    </div>
                  ) : (
                    <span className="text-slate-500">Seleccionar cuenta</span>
                  )}
                </div>
                <ChevronDown className="w-4 h-4 text-slate-500" />
              </button>

              {/* From Picker Dropdown */}
              {showFromPicker && emailAccounts.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-20 max-h-64 overflow-y-auto">
                  {emailAccounts.map((account) => (
                    <button
                      key={account.id}
                      onClick={() => {
                        setSelectedAccount(account);
                        setShowFromPicker(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-700 transition-colors text-left ${
                        selectedAccount?.id === account.id ? 'bg-slate-700/50' : ''
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                        account.type === 'shared' ? 'bg-cyan-600' : 'bg-slate-600'
                      }`}>
                        {account.name[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-white truncate">{account.name}</p>
                          {account.type === 'shared' && (
                            <span className="text-xs bg-cyan-500/20 text-cyan-400 px-1.5 py-0.5 rounded">Compartida</span>
                          )}
                          {account.is_owner && account.type === 'personal' && (
                            <span className="text-xs bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded">Tu cuenta</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 truncate">{account.email}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {emailAccounts.length === 0 && !loadingAccounts && (
              <p className="text-xs text-amber-400">
                No tienes cuentas de email configuradas. Contacta al administrador.
              </p>
            )}
          </div>

          {/* To Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Para:</label>
            <div className="relative">
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <input
                    type="email"
                    value={toEmail}
                    onChange={(e) => setToEmail(e.target.value)}
                    placeholder="email@ejemplo.com"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
                <button
                  onClick={() => setShowLeadPicker(!showLeadPicker)}
                  className="flex items-center gap-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-white hover:border-slate-600 transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline text-sm">Lead</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              {/* Lead Picker Dropdown */}
              {showLeadPicker && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-10 max-h-64 overflow-hidden">
                  <div className="p-2 border-b border-slate-700">
                    <input
                      type="text"
                      value={leadSearch}
                      onChange={(e) => setLeadSearch(e.target.value)}
                      placeholder="Buscar lead..."
                      className="w-full px-3 py-1.5 bg-slate-700 border border-slate-600 rounded text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                      autoFocus
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {loadingLeads ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="w-5 h-5 text-slate-500 animate-spin" />
                      </div>
                    ) : filteredLeads.length === 0 ? (
                      <div className="px-3 py-4 text-sm text-slate-500 text-center">
                        No se encontraron leads
                      </div>
                    ) : (
                      filteredLeads.map((lead) => (
                        <button
                          key={lead.id}
                          onClick={() => handleSelectLead(lead)}
                          className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-700 transition-colors text-left"
                        >
                          <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {lead.nombre[0]?.toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white truncate">{lead.nombre}</p>
                            <p className="text-xs text-slate-500 truncate">
                              {lead.telefono} - {lead.localidad || 'Sin localidad'}
                            </p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            {toName && (
              <p className="text-xs text-slate-500">
                Enviando a: <span className="text-slate-400">{toName}</span>
              </p>
            )}
          </div>

          {/* Template Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Template:</label>
            <div className="relative">
              <button
                onClick={() => setShowTemplatePicker(!showTemplatePicker)}
                className="w-full flex items-center justify-between px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-left hover:border-slate-600 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-500" />
                  <span className={selectedTemplate ? 'text-white' : 'text-slate-500'}>
                    {selectedTemplate?.name || 'Seleccionar template (opcional)'}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-500" />
              </button>

              {/* Template Picker Dropdown */}
              {showTemplatePicker && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                  {loadingTemplates ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-5 h-5 text-slate-500 animate-spin" />
                    </div>
                  ) : templates.length === 0 ? (
                    <div className="px-3 py-4 text-sm text-slate-500 text-center">
                      No hay templates disponibles
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setSelectedTemplate(null);
                          setShowTemplatePicker(false);
                        }}
                        className="w-full px-3 py-2 text-sm text-slate-400 hover:bg-slate-700 text-left transition-colors"
                      >
                        Sin template
                      </button>
                      {templates.map((template) => (
                        <button
                          key={template.id}
                          onClick={() => applyTemplate(template)}
                          className="w-full px-3 py-2 hover:bg-slate-700 transition-colors text-left"
                        >
                          <p className="text-sm text-white">{template.name}</p>
                          <p className="text-xs text-slate-500 truncate">{template.subject}</p>
                        </button>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Asunto:</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Asunto del email"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          {/* Body */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Mensaje:</label>
            <textarea
              value={stripHtml(bodyHtml)}
              onChange={(e) => setBodyHtml(`<p>${e.target.value.replace(/\n/g, '</p><p>')}</p>`)}
              placeholder="Escribe tu mensaje aquí..."
              rows={12}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors resize-none"
            />
            <p className="text-xs text-slate-500">
              Tip: Usa templates para mensajes predefinidos con formato HTML
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 px-4 py-3 border-t border-slate-800">
        <button
          onClick={onCancel}
          disabled={sending}
          className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          onClick={handleSend}
          disabled={sending || !toEmail || !subject}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {sending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Enviar
            </>
          )}
        </button>
      </div>
    </div>
  );
}
