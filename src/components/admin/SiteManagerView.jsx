import React, { useEffect, useState } from 'react';
import ImageDropSlot from './ImageDropSlot';
import {
  fetchSiteContent, updateSiteContentBulk, uploadSiteImage,
  fetchSiteFaq, createSiteFaqItem, updateSiteFaqItem, deleteSiteFaqItem,
} from '../../lib/siteContent';

const HERO_KEYS = ['hero_eyebrow', 'hero_title', 'hero_address'];
const SOBRE_KEYS = [
  'sobre_title', 'sobre_paragraph_1', 'sobre_paragraph_2',
  'sobre_stat_1_value', 'sobre_stat_1_label',
  'sobre_stat_2_value', 'sobre_stat_2_label',
  'sobre_stat_3_value', 'sobre_stat_3_label',
];
const FOOTER_KEYS = [
  'footer_description', 'footer_address_line1', 'footer_address_line2',
  'footer_phone', 'footer_email', 'footer_hours_line1', 'footer_hours_line2',
];

const emptyFaqForm = { question: '', answer: '' };

const SiteManagerView = () => {
  const [content, setContent] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingCard, setSavingCard] = useState(null);
  const [savedCard, setSavedCard] = useState(null);

  const [faqList, setFaqList] = useState([]);
  const [newFaq, setNewFaq] = useState(emptyFaqForm);
  const [savingRow, setSavingRow] = useState(null);

  useEffect(() => {
    Promise.all([fetchSiteContent(), fetchSiteFaq()])
      .then(([contentData, faqData]) => {
        setContent(contentData);
        setFaqList(faqData);
      })
      .catch((err) => console.error('Erro ao carregar conteúdo do site:', err))
      .finally(() => setLoading(false));
  }, []);

  const setField = (key) => (e) => {
    const { value } = e.target;
    setContent((c) => ({ ...c, [key]: value }));
  };

  const flashSaved = (cardId) => {
    setSavedCard(cardId);
    setTimeout(() => setSavedCard((current) => (current === cardId ? null : current)), 1800);
  };

  const handleSaveCard = async (cardId, keys) => {
    setSavingCard(cardId);
    try {
      const entries = {};
      keys.forEach((k) => { entries[k] = content[k] ?? ''; });
      await updateSiteContentBulk(entries);
      flashSaved(cardId);
    } catch (err) {
      console.error('Erro ao salvar:', err);
      window.alert(`Não foi possível salvar: ${err.message || 'erro desconhecido'}`);
    } finally {
      setSavingCard(null);
    }
  };

  const handleImageUpload = (key, slug) => async (file) => {
    try {
      const url = await uploadSiteImage(file, slug);
      setContent((c) => ({ ...c, [key]: url }));
      await updateSiteContentBulk({ [key]: url });
    } catch (err) {
      console.error('Erro ao enviar imagem:', err);
      window.alert(`Não foi possível enviar a imagem: ${err.message || 'erro desconhecido'}`);
    }
  };

  // ---- Perguntas Frequentes (FAQ) ----

  const setFaqField = (id, field) => (e) => {
    const { value } = e.target;
    setFaqList((list) => list.map((f) => (f.id === id ? { ...f, [field]: value } : f)));
  };

  const handleSaveFaq = async (item) => {
    setSavingRow(item.id);
    try {
      await updateSiteFaqItem(item.id, { question: item.question, answer: item.answer });
      flashSaved(item.id);
    } catch (err) {
      console.error('Erro ao salvar pergunta:', err);
      window.alert(`Não foi possível salvar: ${err.message || 'erro desconhecido'}`);
    } finally {
      setSavingRow(null);
    }
  };

  const handleDeleteFaq = async (id) => {
    if (!window.confirm('Remover esta pergunta do FAQ?')) return;
    try {
      await deleteSiteFaqItem(id);
      setFaqList((list) => list.filter((f) => f.id !== id));
    } catch (err) {
      console.error('Erro ao remover pergunta:', err);
      window.alert(`Não foi possível remover: ${err.message || 'erro desconhecido'}`);
    }
  };

  const handleAddFaq = async () => {
    if (!newFaq.question.trim() || !newFaq.answer.trim()) {
      window.alert('Preencha a pergunta e a resposta.');
      return;
    }
    setSavingRow('new-faq');
    try {
      const created = await createSiteFaqItem({
        question: newFaq.question.trim(),
        answer: newFaq.answer.trim(),
        sort_order: faqList.length + 1,
      });
      setFaqList((list) => [...list, created]);
      setNewFaq(emptyFaqForm);
    } catch (err) {
      console.error('Erro ao adicionar pergunta:', err);
      window.alert(`Não foi possível adicionar: ${err.message || 'erro desconhecido'}`);
    } finally {
      setSavingRow(null);
    }
  };

  if (loading) {
    return (
      <div>
        <div className="admin-page-header">
          <span className="section-eyebrow">CMS</span>
          <h1 className="admin-page-title">Gerenciar Site</h1>
        </div>
        <p>Carregando conteúdo do site...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="admin-page-header">
        <span className="section-eyebrow">CMS</span>
        <h1 className="admin-page-title">Gerenciar Site</h1>
        <p className="admin-page-subtitle">Edite os textos e imagens exibidos no site institucional.</p>
      </div>

      <div className="admin-site-sections">
        <div className="admin-card">
          <div className="admin-site-card-header">
            <h3 className="admin-card-title">Seção Hero (topo do site)</h3>
            <button
              type="button"
              onClick={() => handleSaveCard('hero', HERO_KEYS)}
              disabled={savingCard === 'hero'}
              className={`admin-save-button ${savedCard === 'hero' ? 'saved' : ''}`}
            >
              {savingCard === 'hero' ? 'Salvando...' : savedCard === 'hero' ? 'Salvo ✓' : 'Salvar Alterações'}
            </button>
          </div>
          <div className="admin-site-card-body">
            <div>
              <label className="admin-small-label">Frase de destaque (acima do título)</label>
              <input type="text" value={content.hero_eyebrow || ''} onChange={setField('hero_eyebrow')} className="field-input" />
              <label className="admin-small-label admin-small-label-spaced">Título principal</label>
              <textarea rows="2" value={content.hero_title || ''} onChange={setField('hero_title')} className="field-input field-textarea" />
              <label className="admin-small-label admin-small-label-spaced">Endereço</label>
              <input type="text" value={content.hero_address || ''} onChange={setField('hero_address')} className="field-input" />
            </div>
            <div>
              <label className="admin-small-label">Foto</label>
              <ImageDropSlot
                placeholder="Arraste uma imagem aqui"
                className="admin-site-image-slot"
                initialUrl={content.hero_photo_url}
                onFileSelected={handleImageUpload('hero_photo_url', 'hero-photo')}
              />
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-site-card-header">
            <h3 className="admin-card-title">Seção Sobre a Clínica</h3>
            <button
              type="button"
              onClick={() => handleSaveCard('sobre', SOBRE_KEYS)}
              disabled={savingCard === 'sobre'}
              className={`admin-save-button ${savedCard === 'sobre' ? 'saved' : ''}`}
            >
              {savingCard === 'sobre' ? 'Salvando...' : savedCard === 'sobre' ? 'Salvo ✓' : 'Salvar Alterações'}
            </button>
          </div>
          <div className="admin-site-card-body admin-site-card-body-single">
            <div>
              <label className="admin-small-label">Título</label>
              <input type="text" value={content.sobre_title || ''} onChange={setField('sobre_title')} className="field-input" />
              <label className="admin-small-label admin-small-label-spaced">Parágrafo 1</label>
              <textarea rows="3" value={content.sobre_paragraph_1 || ''} onChange={setField('sobre_paragraph_1')} className="field-input field-textarea" />
              <label className="admin-small-label admin-small-label-spaced">Parágrafo 2</label>
              <textarea rows="2" value={content.sobre_paragraph_2 || ''} onChange={setField('sobre_paragraph_2')} className="field-input field-textarea" />
              <label className="admin-small-label admin-small-label-spaced">Indicadores</label>
              <div className="admin-cadastro-row">
                <input type="text" placeholder="Valor (ex: 12)" value={content.sobre_stat_1_value || ''} onChange={setField('sobre_stat_1_value')} className="field-input" />
                <input type="text" placeholder="Legenda" value={content.sobre_stat_1_label || ''} onChange={setField('sobre_stat_1_label')} className="field-input" />
              </div>
              <div className="admin-cadastro-row">
                <input type="text" placeholder="Valor (ex: 15k+)" value={content.sobre_stat_2_value || ''} onChange={setField('sobre_stat_2_value')} className="field-input" />
                <input type="text" placeholder="Legenda" value={content.sobre_stat_2_label || ''} onChange={setField('sobre_stat_2_label')} className="field-input" />
              </div>
              <div className="admin-cadastro-row">
                <input type="text" placeholder="Valor (ex: 98%)" value={content.sobre_stat_3_value || ''} onChange={setField('sobre_stat_3_value')} className="field-input" />
                <input type="text" placeholder="Legenda" value={content.sobre_stat_3_label || ''} onChange={setField('sobre_stat_3_label')} className="field-input" />
              </div>
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-site-card-header">
            <h3 className="admin-card-title">Seção A Clínica (foto do espaço)</h3>
          </div>
          <div className="admin-site-card-body admin-site-card-body-single">
            <div>
              <label className="admin-small-label">Foto</label>
              <ImageDropSlot
                placeholder="Arraste uma imagem aqui"
                className="admin-site-image-slot"
                initialUrl={content.clinica_photo_url}
                onFileSelected={handleImageUpload('clinica_photo_url', 'clinica-photo')}
              />
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-site-card-header">
            <h3 className="admin-card-title">Rodapé / Contato</h3>
            <button
              type="button"
              onClick={() => handleSaveCard('footer', FOOTER_KEYS)}
              disabled={savingCard === 'footer'}
              className={`admin-save-button ${savedCard === 'footer' ? 'saved' : ''}`}
            >
              {savingCard === 'footer' ? 'Salvando...' : savedCard === 'footer' ? 'Salvo ✓' : 'Salvar Alterações'}
            </button>
          </div>
          <div className="admin-site-card-body admin-site-card-body-single">
            <div>
              <label className="admin-small-label">Frase de apresentação</label>
              <input type="text" value={content.footer_description || ''} onChange={setField('footer_description')} className="field-input" />
              <label className="admin-small-label admin-small-label-spaced">Endereço — linha 1</label>
              <input type="text" value={content.footer_address_line1 || ''} onChange={setField('footer_address_line1')} className="field-input" />
              <label className="admin-small-label admin-small-label-spaced">Endereço — linha 2</label>
              <input type="text" value={content.footer_address_line2 || ''} onChange={setField('footer_address_line2')} className="field-input" />
              <div className="admin-cadastro-row admin-small-label-spaced">
                <div>
                  <label className="admin-small-label">Telefone</label>
                  <input type="text" value={content.footer_phone || ''} onChange={setField('footer_phone')} className="field-input" />
                </div>
                <div>
                  <label className="admin-small-label">E-mail</label>
                  <input type="text" value={content.footer_email || ''} onChange={setField('footer_email')} className="field-input" />
                </div>
              </div>
              <div className="admin-cadastro-row admin-small-label-spaced">
                <div>
                  <label className="admin-small-label">Horário — linha 1</label>
                  <input type="text" value={content.footer_hours_line1 || ''} onChange={setField('footer_hours_line1')} className="field-input" />
                </div>
                <div>
                  <label className="admin-small-label">Horário — linha 2</label>
                  <input type="text" value={content.footer_hours_line2 || ''} onChange={setField('footer_hours_line2')} className="field-input" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-site-card-header">
            <h3 className="admin-card-title">Perguntas Frequentes (FAQ)</h3>
          </div>
          <div className="admin-faq-table">
            {faqList.map((item) => (
              <div key={item.id} className="admin-faq-row">
                <div className="admin-faq-row-fields">
                  <input type="text" placeholder="Pergunta" value={item.question} onChange={setFaqField(item.id, 'question')} className="field-input" />
                  <textarea rows="2" placeholder="Resposta" value={item.answer} onChange={setFaqField(item.id, 'answer')} className="field-input field-textarea" />
                </div>
                <div className="admin-price-row-actions">
                  <button
                    type="button"
                    onClick={() => handleSaveFaq(item)}
                    disabled={savingRow === item.id}
                    className={`admin-save-button admin-save-button-sm ${savedCard === item.id ? 'saved' : ''}`}
                  >
                    {savingRow === item.id ? '...' : savedCard === item.id ? '✓' : 'Salvar'}
                  </button>
                  <button type="button" onClick={() => handleDeleteFaq(item.id)} className="admin-delete-row-btn">✕</button>
                </div>
              </div>
            ))}
            <div className="admin-faq-row admin-faq-row-new">
              <div className="admin-faq-row-fields">
                <input type="text" placeholder="Nova pergunta" value={newFaq.question} onChange={(e) => setNewFaq((f) => ({ ...f, question: e.target.value }))} className="field-input" />
                <textarea rows="2" placeholder="Resposta" value={newFaq.answer} onChange={(e) => setNewFaq((f) => ({ ...f, answer: e.target.value }))} className="field-input field-textarea" />
              </div>
              <div className="admin-price-row-actions">
                <button type="button" onClick={handleAddFaq} disabled={savingRow === 'new-faq'} className="admin-save-button admin-save-button-sm">
                  {savingRow === 'new-faq' ? '...' : '+ Adicionar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteManagerView;
