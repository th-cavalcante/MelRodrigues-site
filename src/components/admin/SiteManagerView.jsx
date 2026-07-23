import React, { useEffect, useState } from 'react';
import ImageDropSlot from './ImageDropSlot';
import {
  fetchSiteContent, updateSiteContentBulk, uploadSiteImage,
  fetchSiteCombos, createSiteCombo, updateSiteCombo, deleteSiteCombo,
  fetchSiteFaq, createSiteFaqItem, updateSiteFaqItem, deleteSiteFaqItem,
} from '../../lib/siteContent';
import { fetchLaserServices, createLaserService, updateLaserService, deleteLaserService } from '../../lib/services';

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

const emptyServiceForm = { name: '', note: '', price: '', original: '', installment: '' };
const emptyComboForm = { label: '', title: '', price_from: '', price_to: '' };
const emptyFaqForm = { question: '', answer: '' };

const SiteManagerView = () => {
  const [content, setContent] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingCard, setSavingCard] = useState(null);
  const [savedCard, setSavedCard] = useState(null);

  const [servicesList, setServicesList] = useState([]);
  const [combosList, setCombosList] = useState([]);
  const [faqList, setFaqList] = useState([]);
  const [newService, setNewService] = useState(emptyServiceForm);
  const [newCombo, setNewCombo] = useState(emptyComboForm);
  const [newFaq, setNewFaq] = useState(emptyFaqForm);
  const [savingRow, setSavingRow] = useState(null);

  useEffect(() => {
    Promise.all([fetchSiteContent(), fetchLaserServices(), fetchSiteCombos(), fetchSiteFaq()])
      .then(([contentData, servicesData, combosData, faqData]) => {
        setContent(contentData);
        setServicesList(servicesData);
        setCombosList(combosData);
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

  // ---- Tabela de Preço: sessões avulsas ----

  const setServiceField = (id, field) => (e) => {
    const { value } = e.target;
    setServicesList((list) => list.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const handleSaveService = async (svc) => {
    setSavingRow(svc.id);
    try {
      await updateLaserService(svc.id, {
        name: svc.name,
        note: svc.note,
        price: Number(svc.price) || 0,
        original: Number(svc.original) || 0,
        installment: Number(svc.installment) || 0,
      });
      flashSaved(svc.id);
    } catch (err) {
      console.error('Erro ao salvar serviço:', err);
      window.alert(`Não foi possível salvar: ${err.message || 'erro desconhecido'}`);
    } finally {
      setSavingRow(null);
    }
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm('Remover este tratamento da Tabela de Preço?')) return;
    try {
      await deleteLaserService(id);
      setServicesList((list) => list.filter((s) => s.id !== id));
    } catch (err) {
      console.error('Erro ao remover serviço:', err);
      window.alert(`Não foi possível remover: ${err.message || 'erro desconhecido'}`);
    }
  };

  const handleAddService = async () => {
    if (!newService.name.trim() || !newService.price) {
      window.alert('Preencha ao menos o nome e o preço do tratamento.');
      return;
    }
    setSavingRow('new-service');
    try {
      const created = await createLaserService({
        name: newService.name.trim(),
        note: newService.note.trim(),
        price: Number(newService.price) || 0,
        original: Number(newService.original) || 0,
        installment: Number(newService.installment) || 0,
        sort_order: servicesList.length + 1,
      });
      setServicesList((list) => [...list, created]);
      setNewService(emptyServiceForm);
    } catch (err) {
      console.error('Erro ao adicionar serviço:', err);
      window.alert(`Não foi possível adicionar: ${err.message || 'erro desconhecido'}`);
    } finally {
      setSavingRow(null);
    }
  };

  // ---- Tabela de Preço: combos ----

  const setComboField = (id, field) => (e) => {
    const { value } = e.target;
    setCombosList((list) => list.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  };

  const handleSaveCombo = async (combo) => {
    setSavingRow(combo.id);
    try {
      await updateSiteCombo(combo.id, {
        label: combo.label,
        title: combo.title,
        price_from: Number(combo.price_from) || 0,
        price_to: Number(combo.price_to) || 0,
      });
      flashSaved(combo.id);
    } catch (err) {
      console.error('Erro ao salvar combo:', err);
      window.alert(`Não foi possível salvar: ${err.message || 'erro desconhecido'}`);
    } finally {
      setSavingRow(null);
    }
  };

  const handleDeleteCombo = async (id) => {
    if (!window.confirm('Remover este combo da Tabela de Preço?')) return;
    try {
      await deleteSiteCombo(id);
      setCombosList((list) => list.filter((c) => c.id !== id));
    } catch (err) {
      console.error('Erro ao remover combo:', err);
      window.alert(`Não foi possível remover: ${err.message || 'erro desconhecido'}`);
    }
  };

  const handleAddCombo = async () => {
    if (!newCombo.label.trim() || !newCombo.title.trim() || !newCombo.price_to) {
      window.alert('Preencha ao menos o rótulo, o título e o preço final do combo.');
      return;
    }
    setSavingRow('new-combo');
    try {
      const created = await createSiteCombo({
        label: newCombo.label.trim(),
        title: newCombo.title.trim(),
        price_from: Number(newCombo.price_from) || 0,
        price_to: Number(newCombo.price_to) || 0,
        sort_order: combosList.length + 1,
      });
      setCombosList((list) => [...list, created]);
      setNewCombo(emptyComboForm);
    } catch (err) {
      console.error('Erro ao adicionar combo:', err);
      window.alert(`Não foi possível adicionar: ${err.message || 'erro desconhecido'}`);
    } finally {
      setSavingRow(null);
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
        <p className="admin-page-subtitle">Edite os textos, imagens e a tabela de preço exibidos no site institucional.</p>
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
            <h3 className="admin-card-title">Tabela de Preço — Sessões Avulsas</h3>
          </div>
          <div className="admin-price-table">
            <div className="admin-price-row admin-price-row-header">
              <span>Tratamento</span>
              <span>Observação</span>
              <span>Preço à vista</span>
              <span>Preço "de"</span>
              <span>Parcela 2x</span>
              <span></span>
            </div>
            {servicesList.map((s) => (
              <div key={s.id} className="admin-price-row">
                <input type="text" value={s.name} onChange={setServiceField(s.id, 'name')} className="field-input" />
                <input type="text" value={s.note || ''} onChange={setServiceField(s.id, 'note')} className="field-input" />
                <input type="number" step="0.01" value={s.price} onChange={setServiceField(s.id, 'price')} className="field-input" />
                <input type="number" step="0.01" value={s.original || ''} onChange={setServiceField(s.id, 'original')} className="field-input" />
                <input type="number" step="0.01" value={s.installment || ''} onChange={setServiceField(s.id, 'installment')} className="field-input" />
                <div className="admin-price-row-actions">
                  <button
                    type="button"
                    onClick={() => handleSaveService(s)}
                    disabled={savingRow === s.id}
                    className={`admin-save-button admin-save-button-sm ${savedCard === s.id ? 'saved' : ''}`}
                  >
                    {savingRow === s.id ? '...' : savedCard === s.id ? '✓' : 'Salvar'}
                  </button>
                  <button type="button" onClick={() => handleDeleteService(s.id)} className="admin-delete-row-btn">✕</button>
                </div>
              </div>
            ))}
            <div className="admin-price-row admin-price-row-new">
              <input type="text" placeholder="Nome do tratamento" value={newService.name} onChange={(e) => setNewService((f) => ({ ...f, name: e.target.value }))} className="field-input" />
              <input type="text" placeholder="Observação (opcional)" value={newService.note} onChange={(e) => setNewService((f) => ({ ...f, note: e.target.value }))} className="field-input" />
              <input type="number" step="0.01" placeholder="Preço" value={newService.price} onChange={(e) => setNewService((f) => ({ ...f, price: e.target.value }))} className="field-input" />
              <input type="number" step="0.01" placeholder="De" value={newService.original} onChange={(e) => setNewService((f) => ({ ...f, original: e.target.value }))} className="field-input" />
              <input type="number" step="0.01" placeholder="2x de" value={newService.installment} onChange={(e) => setNewService((f) => ({ ...f, installment: e.target.value }))} className="field-input" />
              <div className="admin-price-row-actions">
                <button type="button" onClick={handleAddService} disabled={savingRow === 'new-service'} className="admin-save-button admin-save-button-sm">
                  {savingRow === 'new-service' ? '...' : '+ Adicionar'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-site-card-header">
            <h3 className="admin-card-title">Tabela de Preço — Combos</h3>
          </div>
          <div className="admin-price-table">
            <div className="admin-price-row admin-price-row-header admin-price-row-combo">
              <span>Rótulo</span>
              <span>Descrição</span>
              <span>De (R$)</span>
              <span>Por (R$)</span>
              <span></span>
            </div>
            {combosList.map((c) => (
              <div key={c.id} className="admin-price-row admin-price-row-combo">
                <input type="text" value={c.label} onChange={setComboField(c.id, 'label')} className="field-input" />
                <input type="text" value={c.title} onChange={setComboField(c.id, 'title')} className="field-input" />
                <input type="number" step="0.01" value={c.price_from} onChange={setComboField(c.id, 'price_from')} className="field-input" />
                <input type="number" step="0.01" value={c.price_to} onChange={setComboField(c.id, 'price_to')} className="field-input" />
                <div className="admin-price-row-actions">
                  <button
                    type="button"
                    onClick={() => handleSaveCombo(c)}
                    disabled={savingRow === c.id}
                    className={`admin-save-button admin-save-button-sm ${savedCard === c.id ? 'saved' : ''}`}
                  >
                    {savingRow === c.id ? '...' : savedCard === c.id ? '✓' : 'Salvar'}
                  </button>
                  <button type="button" onClick={() => handleDeleteCombo(c.id)} className="admin-delete-row-btn">✕</button>
                </div>
              </div>
            ))}
            <div className="admin-price-row admin-price-row-new admin-price-row-combo">
              <input type="text" placeholder="Ex: Combo 8" value={newCombo.label} onChange={(e) => setNewCombo((f) => ({ ...f, label: e.target.value }))} className="field-input" />
              <input type="text" placeholder="Ex: Axilas + Buço" value={newCombo.title} onChange={(e) => setNewCombo((f) => ({ ...f, title: e.target.value }))} className="field-input" />
              <input type="number" step="0.01" placeholder="De" value={newCombo.price_from} onChange={(e) => setNewCombo((f) => ({ ...f, price_from: e.target.value }))} className="field-input" />
              <input type="number" step="0.01" placeholder="Por" value={newCombo.price_to} onChange={(e) => setNewCombo((f) => ({ ...f, price_to: e.target.value }))} className="field-input" />
              <div className="admin-price-row-actions">
                <button type="button" onClick={handleAddCombo} disabled={savingRow === 'new-combo'} className="admin-save-button admin-save-button-sm">
                  {savingRow === 'new-combo' ? '...' : '+ Adicionar'}
                </button>
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
