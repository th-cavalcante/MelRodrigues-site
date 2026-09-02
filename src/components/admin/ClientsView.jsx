import React, { useEffect, useState } from 'react';
import ImageDropSlot from './ImageDropSlot';
import { downloadFichaPdf } from '../cliente/fichaPdf';
import { downloadDocPdf } from '../cliente/docPdf';
import { docsMeta } from '../cliente/documentTemplates';
import {
  mapDbPatientToAnamnese,
  getPatient,
  listSessions,
  createSession,
  updateSessionObs,
  deleteSession,
  listDocumentSignatures,
  listPatientPhotos,
  uploadPatientPhoto,
  getSignedPhotoUrls,
  deletePatient,
  updatePatientFields,
} from '../../lib/patients';
import { sendDocumentSignatureLink } from '../../lib/evolution';
import { buildWhatsAppLink, sessionHistoryLabel } from '../../lib/agendaConstants';
import { IconWhatsApp, IconPencil, IconCalendar } from './Icons';

const documentsMeta = [
  { key: 'anamnese', icon: '📋', label: 'Ficha de Anamnese' },
  { key: 'contrato', icon: '✍️', label: 'Contrato de Prestação de Serviço' },
  { key: 'termo', icon: '📄', label: 'Termo de Consentimento' },
];

const ClientsView = ({ clients, setClients }) => {
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [signatures, setSignatures] = useState({});
  const [photos, setPhotos] = useState([]);
  const [photoUrls, setPhotoUrls] = useState({});
  const [assinaturaSending, setAssinaturaSending] = useState(false);
  const [assinaturaSent, setAssinaturaSent] = useState(false);
  const [assinaturaError, setAssinaturaError] = useState('');
  const [copiedSessionId, setCopiedSessionId] = useState(null);
  const [savedSessionId, setSavedSessionId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [fichaLinkCopied, setFichaLinkCopied] = useState(false);
  const [unlockedField, setUnlockedField] = useState(null);
  const [savingField, setSavingField] = useState(null);

  const selectedClient = clients.find((c) => c.id === selectedClientId) || null;
  const filteredClients = clients.filter((c) =>
    (c.name || '').toLowerCase().includes(searchTerm.trim().toLowerCase())
  );

  useEffect(() => {
    setAssinaturaSent(false);
    setAssinaturaError('');
    setFichaLinkCopied(false);
    setUnlockedField(null);
    if (!selectedClientId) return undefined;
    let cancelled = false;

    Promise.all([
      getPatient(selectedClientId),
      listSessions(selectedClientId),
      listDocumentSignatures(selectedClientId),
      listPatientPhotos(selectedClientId),
    ])
      .then(async ([freshPatient, sessionsData, signaturesData, photosData]) => {
        if (cancelled) return;
        setClients((cs) => cs.map((c) => (c.id === selectedClientId ? { ...c, ...freshPatient } : c)));
        setSessions(sessionsData);
        const sigMap = {};
        signaturesData.forEach((s) => {
          sigMap[s.doc_key] = s;
        });
        setSignatures(sigMap);
        setPhotos(photosData);
        const urls = await getSignedPhotoUrls(photosData.map((p) => p.storage_path));
        if (!cancelled) setPhotoUrls(urls);
      })
      .catch((err) => console.error('Erro ao carregar dados do paciente:', err));

    return () => {
      cancelled = true;
    };
  }, [selectedClientId, setClients]);

  const handlePatientFieldChange = (field) => (e) => {
    const { value } = e.target;
    setClients((cs) => cs.map((c) => (c.id === selectedClientId ? { ...c, [field]: value } : c)));
  };

  const savePatientField = (field) => async () => {
    const current = clients.find((c) => c.id === selectedClientId);
    const value = current ? current[field] : null;
    setSavingField(field);
    try {
      await updatePatientFields(selectedClientId, { [field]: value || null });
    } catch (err) {
      console.error('Erro ao salvar alteração do cliente:', err);
    }
    setSavingField(null);
    setUnlockedField(null);
  };

  const handleObsChange = (sessionId) => (e) => {
    const { value } = e.target;
    setSessions((ss) => ss.map((s) => (s.id === sessionId ? { ...s, obs: value } : s)));
  };

  const handleObsBlur = (sessionId) => (e) => {
    updateSessionObs(sessionId, e.target.value).catch((err) =>
      console.error('Erro ao salvar observação:', err)
    );
  };

  const handleSaveSessao = (sessionId, obs) => async () => {
    try {
      await updateSessionObs(sessionId, obs);
      setSavedSessionId(sessionId);
      setTimeout(() => setSavedSessionId((id) => (id === sessionId ? null : id)), 2000);
    } catch (err) {
      console.error('Erro ao salvar sessão:', err);
    }
  };

  const handleCopyFichaLink = async (fichaUrl) => {
    try {
      await navigator.clipboard.writeText(fichaUrl);
      setFichaLinkCopied(true);
      setTimeout(() => setFichaLinkCopied(false), 2000);
    } catch (err) {
      console.error('Erro ao copiar link da ficha:', err);
    }
  };

  const handleCopySessionLink = async (sessionId) => {
    const url = `${window.location.origin}/cliente/sessao?session=${sessionId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedSessionId(sessionId);
      setTimeout(() => setCopiedSessionId((id) => (id === sessionId ? null : id)), 2000);
    } catch (err) {
      console.error('Erro ao copiar link:', err);
    }
  };

  /** Link pronto pra abrir o WhatsApp já com o link de confirmação da sessão
   * preenchido pro número da própria cliente — null se ela não tiver
   * WhatsApp cadastrado. */
  const buildSessionWhatsAppLink = (sessionId, clientName, clientPhone) => {
    const url = `${window.location.origin}/cliente/sessao?session=${sessionId}`;
    return buildWhatsAppLink(clientPhone, `Olá ${clientName || ''}! Segue o link para confirmar sua sessão na MR Laser: ${url}`);
  };

  const handleDelete = async (clientId) => {
    if (!window.confirm('Tem certeza que deseja excluir este paciente? Essa ação não pode ser desfeita.')) return;
    try {
      await deletePatient(clientId);
      setClients((cs) => cs.filter((c) => c.id !== clientId));
      setSelectedClientId(null);
    } catch (err) {
      console.error('Erro ao excluir paciente:', err);
    }
  };

  const handleNovaSessao = async () => {
    try {
      const novaSessao = await createSession(selectedClientId);
      setSessions((ss) => [...ss, novaSessao]);
    } catch (err) {
      console.error('Erro ao criar sessão:', err);
    }
  };

  const handleDeleteSessao = async (sessionId) => {
    if (!window.confirm('Tem certeza que deseja excluir esta sessão?')) return;
    try {
      await deleteSession(sessionId);
      setSessions((ss) => ss.filter((s) => s.id !== sessionId));
    } catch (err) {
      console.error('Erro ao excluir sessão:', err);
    }
  };

  const handlePhotoUpload = (kind, sessionId) => async (file) => {
    try {
      const photo = await uploadPatientPhoto(selectedClientId, sessionId, kind, file);
      setPhotos((ps) => [...ps, photo]);
      const urls = await getSignedPhotoUrls([photo.storage_path]);
      setPhotoUrls((u) => ({ ...u, ...urls }));
    } catch (err) {
      console.error('Erro ao enviar foto:', err);
    }
  };

  const findPhotoUrl = (kind, sessionId) => {
    const photo = photos.find(
      (p) => p.kind === kind && (p.session_id || null) === (sessionId || null)
    );
    return photo ? photoUrls[photo.storage_path] : null;
  };

  const galleryPhotoUrl = (sessionId, index) => {
    const galleryPhotos = photos.filter((p) => p.kind === 'gallery' && p.session_id === sessionId);
    const photo = galleryPhotos[index];
    return photo ? photoUrls[photo.storage_path] : null;
  };

  if (selectedClient) {
    const anamnese = mapDbPatientToAnamnese(selectedClient);
    const isFilled = !!(selectedClient.name && selectedClient.cpf);
    const fichaCompleta = isFilled;
    const fichaUrl = `${window.location.origin}/cliente/ficha?patient=${selectedClient.id}`;
    const assinaturaUrl = `${window.location.origin}/cliente/ficha?patient=${selectedClient.id}&docs=liberado`;

    return (
      <div>
        <button
          type="button"
          onClick={() => setSelectedClientId(null)}
          className="admin-back-link"
        >
          ← Voltar para lista de clientes
        </button>

        <div className="admin-card admin-client-header">
          <ImageDropSlot
            shape="circle"
            placeholder="Foto"
            className="admin-client-avatar"
            initialUrl={findPhotoUrl('avatar', null)}
            onFileSelected={handlePhotoUpload('avatar', null)}
          />
          <div className="admin-client-header-info">
            <div className="admin-client-name-row">
              <input
                type="text"
                value={selectedClient.name || ''}
                placeholder="Aguardando preenchimento"
                readOnly={unlockedField !== 'name'}
                onChange={handlePatientFieldChange('name')}
                className={`admin-client-name-input ${unlockedField === 'name' ? 'admin-client-name-input-unlocked' : ''}`}
              />
              {unlockedField === 'name' ? (
                <button type="button" onClick={savePatientField('name')} disabled={savingField === 'name'} className="admin-client-save-btn">
                  {savingField === 'name' ? '...' : 'Salvar'}
                </button>
              ) : (
                <button type="button" onClick={() => setUnlockedField('name')} className="admin-locacoes-edit-pencil" aria-label="Editar nome">
                  <IconPencil size={13} />
                </button>
              )}
            </div>

            {(selectedClient.age != null || sessionHistoryLabel(selectedClient)) && (
              <div className="admin-client-meta">
                {[selectedClient.age != null ? `${selectedClient.age} anos` : null, sessionHistoryLabel(selectedClient)]
                  .filter(Boolean)
                  .join(' · ')}
              </div>
            )}

            <div className="admin-client-chips">
              <div className={`admin-client-chip ${unlockedField === 'birthdate' ? 'admin-client-chip-unlocked' : ''}`}>
                <IconCalendar size={13} />
                <input
                  type="date"
                  value={selectedClient.birthdate || ''}
                  readOnly={unlockedField !== 'birthdate'}
                  onChange={handlePatientFieldChange('birthdate')}
                  className="admin-client-chip-input"
                />
                {unlockedField === 'birthdate' ? (
                  <button type="button" onClick={savePatientField('birthdate')} disabled={savingField === 'birthdate'} className="admin-client-save-btn admin-client-save-btn-sm">
                    {savingField === 'birthdate' ? '...' : 'Salvar'}
                  </button>
                ) : (
                  <button type="button" onClick={() => setUnlockedField('birthdate')} className="admin-locacoes-edit-pencil" aria-label="Editar data de nascimento">
                    <IconPencil size={12} />
                  </button>
                )}
              </div>
              <div className={`admin-client-chip ${unlockedField === 'phone' ? 'admin-client-chip-unlocked' : ''}`}>
                <IconWhatsApp size={13} />
                <input
                  type="text"
                  value={selectedClient.phone || ''}
                  placeholder="sem WhatsApp"
                  readOnly={unlockedField !== 'phone'}
                  onChange={handlePatientFieldChange('phone')}
                  className="admin-client-chip-input"
                />
                {unlockedField === 'phone' ? (
                  <button type="button" onClick={savePatientField('phone')} disabled={savingField === 'phone'} className="admin-client-save-btn admin-client-save-btn-sm">
                    {savingField === 'phone' ? '...' : 'Salvar'}
                  </button>
                ) : (
                  <button type="button" onClick={() => setUnlockedField('phone')} className="admin-locacoes-edit-pencil" aria-label="Editar WhatsApp">
                    <IconPencil size={12} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="admin-card admin-documents-card">
          <h3 className="admin-card-title">Documentos Digitais</h3>
          <div className="admin-documents-grid">
            {documentsMeta.map((doc) => {
              if (doc.key === 'anamnese') {
                return (
                  <div key={doc.key} className="admin-document-card">
                    <span className="admin-document-icon">{doc.icon}</span>
                    <span className="admin-document-label">{doc.label}</span>
                    <div className={`admin-document-status ${fichaCompleta ? 'admin-document-status-signed' : ''}`}>
                      {fichaCompleta ? `Preenchida por ${selectedClient.name} ✓` : 'Aguardando preenchimento'}
                    </div>
                    <div className="admin-document-actions">
                      {fichaCompleta ? (
                        <button
                          type="button"
                          onClick={() => downloadFichaPdf(anamnese)}
                          className="admin-document-view-btn"
                        >
                          Download
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleCopyFichaLink(fichaUrl)}
                          className="admin-document-view-btn"
                        >
                          {fichaLinkCopied ? 'Copiado ✓' : 'Copiar Link Ficha'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              }

              const meta = docsMeta[doc.key];
              const sig = signatures[doc.key];
              const isSigned = !!sig;
              const signedDateLabel = sig ? new Date(sig.signed_at).toLocaleDateString('pt-BR') : null;
              return (
                <div key={doc.key} className="admin-document-card">
                  <span className="admin-document-icon">{doc.icon}</span>
                  <span className="admin-document-label">{doc.label}</span>
                  <div className={`admin-document-status ${isSigned ? 'admin-document-status-signed' : ''}`}>
                    {isSigned
                      ? `Assinado por ${sig.patient_name_snapshot} em ${signedDateLabel} ✓`
                      : 'Aguardando Assinatura'}
                  </div>
                  <div className="admin-document-actions">
                    {isSigned && (
                      <button
                        type="button"
                        onClick={() =>
                          downloadDocPdf({
                            title: meta.title,
                            body: meta.buildBody(anamnese),
                            signatureDataUrl: sig.signature_data_url,
                            patientName: sig.patient_name_snapshot,
                            dateLabel: signedDateLabel,
                          })
                        }
                        className="admin-document-view-btn"
                      >
                        Download
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {!(signatures.contrato && signatures.termo) && (
            <>
              <div className="admin-document-test-row">
                <div>
                  <div className="admin-document-test-title">Enviar Contrato e Termo para o paciente</div>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    setAssinaturaError('');
                    setAssinaturaSending(true);
                    try {
                      await sendDocumentSignatureLink(selectedClient.id, assinaturaUrl);
                      setAssinaturaSent(true);
                    } catch (err) {
                      setAssinaturaError(err.message || 'Não foi possível enviar a mensagem.');
                    } finally {
                      setAssinaturaSending(false);
                    }
                  }}
                  disabled={assinaturaSending}
                  className="admin-open-client-btn"
                >
                  {assinaturaSending ? 'Enviando…' : assinaturaSent ? 'Enviado ✓' : 'ENVIAR LINK PARA ASSINATURA'}
                </button>
              </div>
              {assinaturaError && <p className="admin-mkt-wpp-error">{assinaturaError}</p>}
            </>
          )}
        </div>

        <div className="admin-card">
          <div className="admin-sessions-header-row">
            <h3 className="admin-card-title">Linha do Tempo das Sessões</h3>
            <button type="button" onClick={handleNovaSessao} className="admin-open-client-btn">
              + Nova Sessão
            </button>
          </div>
          <div className="admin-sessions-timeline">
            {sessions.map((sess) => (
              <div key={sess.id} className="admin-session-card">
                <div className="admin-session-header">
                  <div className="admin-session-header-left">
                    <span className="admin-session-num">Sessão {sess.session_num}</span>
                    <span className="admin-session-date">{sess.session_date || '—'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteSessao(sess.id)}
                    className="admin-delete-btn"
                  >
                    Excluir Sessão
                  </button>
                </div>
                {sess.service && (
                  <div className="admin-session-service">
                    <strong>Regiões:</strong> {sess.service}
                  </div>
                )}
                <div className="admin-session-body">
                  <div>
                    <label className="admin-small-label">
                      Observações (parâmetros do laser / fluência)
                    </label>
                    <textarea
                      rows="3"
                      value={sess.obs || ''}
                      onChange={handleObsChange(sess.id)}
                      onBlur={handleObsBlur(sess.id)}
                      className="field-input field-textarea"
                    />
                  </div>
                  <div>
                    <label className="admin-small-label">Antes / Depois</label>
                    <div className="admin-before-after">
                      <div>
                        <div className="admin-before-after-label">Antes</div>
                        <ImageDropSlot
                          placeholder="Antes"
                          className="admin-before-after-slot"
                          initialUrl={findPhotoUrl('before', sess.id)}
                          onFileSelected={handlePhotoUpload('before', sess.id)}
                        />
                      </div>
                      <div>
                        <div className="admin-before-after-label">Depois</div>
                        <ImageDropSlot
                          placeholder="Depois"
                          className="admin-before-after-slot"
                          initialUrl={findPhotoUrl('after', sess.id)}
                          onFileSelected={handlePhotoUpload('after', sess.id)}
                        />
                      </div>
                    </div>
                    <label className="admin-small-label admin-small-label-spaced">Fotos da Sessão</label>
                    <div className="admin-gallery-grid">
                      {[0, 1, 2, 3].map((n) => (
                        <ImageDropSlot
                          key={n}
                          placeholder="Foto"
                          className="admin-gallery-slot"
                          initialUrl={galleryPhotoUrl(sess.id, n)}
                          onFileSelected={handlePhotoUpload('gallery', sess.id)}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSaveSessao(sess.id, sess.obs || '')}
                  className="admin-open-client-btn admin-session-save-btn"
                >
                  {savedSessionId === sess.id ? 'Sessão Salva ✓' : 'Salvar Sessão'}
                </button>

                <div className="admin-document-test-row">
                  {sess.confirmed_at ? (
                    <div className="admin-document-status admin-document-status-signed">
                      Confirmado pelo paciente em {new Date(sess.confirmed_at).toLocaleDateString('pt-BR')} ✓
                    </div>
                  ) : (
                    <>
                      <div>
                        <div className="admin-document-test-title">Enviar confirmação de sessão para o paciente</div>
                      </div>
                      {(() => {
                        const waLink = buildSessionWhatsAppLink(sess.id, selectedClient.name, selectedClient.phone);
                        return waLink ? (
                          <a href={waLink} target="_blank" rel="noopener noreferrer" className="admin-wa-confirm-btn">
                            <IconWhatsApp size={16} />
                            ENVIAR LINK DE CONFIRMAÇÃO
                          </a>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleCopySessionLink(sess.id)}
                            className="admin-open-client-btn"
                            title="Cliente sem WhatsApp cadastrado"
                          >
                            {copiedSessionId === sess.id ? 'Copiado ✓' : 'COPIAR LINK DE CONFIRMAÇÃO'}
                          </button>
                        );
                      })()}
                    </>
                  )}
                </div>
              </div>
            ))}
            {sessions.length === 0 && (
              <div className="admin-sessions-empty">Nenhuma sessão registrada ainda.</div>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => handleDelete(selectedClient.id)}
          className="admin-delete-btn admin-client-delete-btn"
        >
          Excluir Paciente
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="admin-page-header">
        <span className="section-eyebrow">Área Clínica</span>
        <h1 className="admin-page-title">Clientes e Sessões</h1>
      </div>

      <div className="admin-clients-search">
        <label className="admin-small-label" htmlFor="busca-paciente">
          Busca Paciente
        </label>
        <input
          id="busca-paciente"
          type="text"
          className="field-input"
          placeholder="Buscar por nome..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="admin-card admin-clients-table">
        <div className="admin-clients-row admin-clients-row-header">
          <div>Nome</div>
          <div>Idade</div>
          <div>Última Sessão</div>
          <div></div>
        </div>
        {filteredClients.map((c) => (
          <div key={c.id} className="admin-clients-row">
            <div className="admin-client-name-cell">
              <div className="admin-client-initial">{(c.name || '?').charAt(0)}</div>
              <span>{c.name || 'Aguardando preenchimento'}</span>
            </div>
            <div className="admin-clients-cell">{c.age != null ? c.age : '—'}</div>
            <div className="admin-clients-cell">{sessionHistoryLabel(c) || '—'}</div>
            <div className="admin-clients-row-actions">
              <button
                type="button"
                onClick={() => setSelectedClientId(c.id)}
                className="admin-open-client-btn"
              >
                Abrir Ficha Completa
              </button>
            </div>
          </div>
        ))}
        {filteredClients.length === 0 && (
          <div className="admin-clients-empty">Nenhum paciente encontrado.</div>
        )}
      </div>
    </div>
  );
};

export default ClientsView;
