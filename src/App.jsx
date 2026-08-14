import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import TabelaValores from './pages/TabelaValores';
import CuidadosSessao from './pages/CuidadosSessao';
import LocacaoHakon from './pages/LocacaoHakon';
import CursoDepilacao from './pages/CursoDepilacao';
import AdminLogin from './pages/AdminLogin';
import AdminResetPassword from './pages/AdminResetPassword';
import AdminPanel from './pages/AdminPanel';
import ClienteDocumentos from './pages/ClienteDocumentos';
import FichaPublica from './pages/FichaPublica';
import ConfirmarSessao from './pages/ConfirmarSessao';
import AgendaOnline from './pages/AgendaOnline';
import AnamneseOnline from './pages/AnamneseOnline';
import RentalContrato from './pages/RentalContrato';
import ValidarAssinatura from './pages/ValidarAssinatura';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/valores" element={<TabelaValores />} />
          <Route path="/recomendacoes" element={<CuidadosSessao />} />
          <Route path="/locacao-hakon" element={<LocacaoHakon />} />
          <Route path="/cursos" element={<CursoDepilacao />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/redefinir-senha" element={<AdminResetPassword />} />
          <Route path="/admin/dashboard" element={<AdminPanel />} />
          <Route path="/cliente/documentos" element={<ClienteDocumentos />} />
          <Route path="/cliente/ficha" element={<FichaPublica />} />
          <Route path="/cliente/sessao" element={<ConfirmarSessao />} />
          <Route path="/cliente/agendar" element={<AgendaOnline />} />
          <Route path="/cliente/anamnese" element={<AnamneseOnline />} />
          <Route path="/cliente/locacao" element={<RentalContrato />} />
          <Route path="/validar/:signatureId" element={<ValidarAssinatura />} />
          {/* Rotas futuras serão adicionadas aqui */}
          {/* <Route path="/precos" element={<Precos />} /> */}
          {/* <Route path="/sobre" element={<Sobre />} /> */}
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
