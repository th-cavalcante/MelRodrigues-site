import React, { useEffect, useState } from 'react';
import {
  fetchSiteCombos, createSiteCombo, updateSiteCombo, deleteSiteCombo,
} from '../../lib/siteContent';
import { fetchLaserServices, createLaserService, updateLaserService, deleteLaserService } from '../../lib/services';

const emptyServiceForm = { name: '', note: '', price: '', original: '', installment: '' };
const emptyComboForm = { label: '', title: '', price_from: '', price_to: '' };

const TabelaPrecoView = () => {
  const [loading, setLoading] = useState(true);
  const [servicesList, setServicesList] = useState([]);
  const [combosList, setCombosList] = useState([]);
  const [newService, setNewService] = useState(emptyServiceForm);
  const [newCombo, setNewCombo] = useState(emptyComboForm);
  const [savingRow, setSavingRow] = useState(null);
  const [savedRow, setSavedRow] = useState(null);

  useEffect(() => {
    Promise.all([fetchLaserServices(), fetchSiteCombos()])
      .then(([servicesData, combosData]) => {
        setServicesList(servicesData);
        setCombosList(combosData);
      })
      .catch((err) => console.error('Erro ao carregar tabela de preço:', err))
      .finally(() => setLoading(false));
  }, []);

  const flashSaved = (rowId) => {
    setSavedRow(rowId);
    setTimeout(() => setSavedRow((current) => (current === rowId ? null : current)), 1800);
  };

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

  if (loading) {
    return (
      <div>
        <div className="admin-page-header">
          <span className="section-eyebrow">Preços</span>
          <h1 className="admin-page-title">Tabela de Preço</h1>
        </div>
        <p>Carregando tabela de preço...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="admin-page-header">
        <span className="section-eyebrow">Preços</span>
        <h1 className="admin-page-title">Tabela de Preço</h1>
        <p className="admin-page-subtitle">Edite os tratamentos avulsos e os combos exibidos na Tabela de Preço do site.</p>
      </div>

      <div className="admin-site-sections">
        <div className="admin-card">
          <div className="admin-site-card-header">
            <h3 className="admin-card-title">Sessões Avulsas</h3>
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
                    className={`admin-save-button admin-save-button-sm ${savedRow === s.id ? 'saved' : ''}`}
                  >
                    {savingRow === s.id ? '...' : savedRow === s.id ? '✓' : 'Salvar'}
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
            <h3 className="admin-card-title">Combos</h3>
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
                    className={`admin-save-button admin-save-button-sm ${savedRow === c.id ? 'saved' : ''}`}
                  >
                    {savingRow === c.id ? '...' : savedRow === c.id ? '✓' : 'Salvar'}
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
      </div>
    </div>
  );
};

export default TabelaPrecoView;
