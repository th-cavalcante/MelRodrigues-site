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
} from '../../lib/patients';

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
  const [showAssinaturaLink, setShowAssinaturaLink] = useState(false);
  const [assinaturaLinkCopied, setAssinaturaLinkCopied] = useState(false);
  const [copiedSessionId, setCopiedSessionId] = useState(null);
  const [savedSessionId, setSavedSessionId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [fichaLinkCopied, setFichaLinkCopied] = useState(false);

  const selectedClient = clients.find((c) => c.id === selectedClientId) || null;
  const filteredClients = clients.filter((c) =>
    (c.name || '').toLowerCase().includes(searchTerm.trim().toLowerCase())
  );

  useEffect(() => {
    setShowAssinaturaLink(false);
    setAssinaturaLinkCopied(false);
    setFichaLinkCopied(false);
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
          <div>
            <h2 className="admin-client-name">{selectedClient.name || 'Aguardando preenchimento'}</h2>
            <div className="admin-client-meta">
              {selectedClient.age != null ? `${selectedClient.age} anos · ` : ''}
              Última sessão em {selectedClient.lastSession || '—'}
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
                    setShowAssinaturaLink((v) => !v);
                    try {
                      await navigator.clipboard.writeText(assinaturaUrl);
                      setAssinaturaLinkCopied(true);
                      setTimeout(() => setAssinaturaLinkCopied(false), 2000);
                    } catch (err) {
                      console.error('Erro ao copiar link automaticamente:', err);
                    }
                  }}
                  className="admin-open-client-btn"
                >
                  {assinaturaLinkCopied ? 'Copiado ✓' : 'ENVIAR LINK PARA ASSINATURA'}
                </button>
              </div>
              {showAssinaturaLink && (
                <div className="admin-cadastro-linkbox">
                  <span className="admin-cadastro-link-text">{assinaturaUrl}</span>
                  <div className="admin-cadastro-linkbox-actions">
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(assinaturaUrl);
                          setAssinaturaLinkCopied(true);
                          setTimeout(() => setAssinaturaLinkCopied(false), 2000);
                        } catch (err) {
                          console.error('Erro ao copiar link:', err);
                        }
                      }}
                      className="admin-cadastro-copy-btn"
                    >
                      {assinaturaLinkCopied ? 'Copiado ✓' : 'Copiar'}
                    </button>
                    <a href={assinaturaUrl} target="_blank" rel="noopener noreferrer" className="admin-cadastro-copy-btn">
                      Abrir em nova aba
                    </a>
                  </div>
                </div>
              )}
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
                      <button
                        type="button"
                        onClick={() => handleCopySessionLink(sess.id)}
                        className="admin-open-client-btn"
                      >
                        {copiedSessionId === sess.id ? 'Copiado ✓' : 'ENVIAR LINK DE CONFIRMAÇÃO'}
                      </button>
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
            <div className="admin-clients-cell">{c.lastSession || '—'}</div>
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
