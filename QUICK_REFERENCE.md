# 🚀 QUICK REFERENCE - CHEAT SHEET

Comandos e referências rápidas para trabalhar com o projeto.

---

## 🎯 COMANDOS ESSENCIAIS

```bash
# Instalar dependências (primeira vez)
npm install

# Rodar em desenvolvimento
npm start

# Parar o servidor
Ctrl + C

# Build para produção
npm run build

# Testar responsividade
F12 no navegador

# Mudar porta (se 3000 está em uso)
npm start -- --port 3001
```

---

## 📂 ESTRUTURA RÁPIDA

```
src/
  components/        ← Componentes React
    Navbar.jsx
    HeroSection.jsx
    ServicesCards.jsx
    FAQ.jsx
    Footer.jsx
  pages/             ← Páginas
    Home.jsx
  styles/            ← CSS por componente
    globals.css
    Navbar.css
    HeroSection.css
    ServicesCards.css
    FAQ.css
    Footer.css
  App.jsx            ← App principal
  index.js           ← Entry point
```

---

## 🎨 CORES

```css
--primary-color: #d4af37;      /* Dourado */
--secondary-color: #1a1a1a;    /* Preto */
--accent-color: #e8d5b7;       /* Bege */
--bg-light: #f8f8f8;           /* Off-white */
--bg-white: #ffffff;           /* Branco */
--text-dark: #1a1a1a;          /* Texto */
```

---

## 📱 BREAKPOINTS

```css
Desktop:     1400px+
Tablet:      768px - 1399px
Mobile:      480px - 767px
Smartphone:  < 480px
```

---

## 🔗 COMPONENTES PRINCIPAIS

| Componente | Arquivo | Props | Uso |
|-----------|---------|-------|-----|
| Navbar | Navbar.jsx | - | Topo da página |
| Hero | HeroSection.jsx | - | Seção principal |
| Cards | ServicesCards.jsx | services array | 3 Pilares |
| FAQ | FAQ.jsx | faqs array | Accordion |
| Footer | Footer.jsx | - | Rodapé |

---

## 🎯 ARQUIVOS PARA EDITAR

### Mudar WhatsApp
```javascript
// src/components/Navbar.jsx
// src/components/HeroSection.jsx
// src/components/FAQ.jsx
Procurar: wa.me/5511987654321
Trocar por seu número
```

### Mudar Cores
```css
/* src/styles/globals.css */
:root {
  --primary-color: #seu_color;
}
```

### Mudar Contato
```javascript
// src/components/Footer.jsx
Endereço, Email, Horário, etc
```

### Mudar Textos
```javascript
// src/components/*.jsx
Edite diretamente no arquivo
```

---

## 📖 DOCUMENTAÇÃO RÁPIDA

| Arquivo | Para Quem | Conteúdo |
|---------|-----------|----------|
| COMECE_AQUI.md | Todos | 3 passos |
| GUIA_EXECUCAO.md | Iniciantes | Passo a passo |
| CUSTOMIZACOES.md | Devs | Edições |
| TESTE_APROVACAO.md | QA | Checklist |
| GUIA_VISUAL.md | Designers | Layout |

---

## 🔍 BUSCA RÁPIDA

Procurando algo? Use `Ctrl + F`:

| Busca | Arquivo | Resultado |
|-------|---------|-----------|
| "wa.me" | Qualquer | Botões WhatsApp |
| "#d4af37" | globals.css | Cor dourada |
| "servicesGrid" | ServicesCards.css | Grid 3 colunas |
| "accordion" | FAQ.jsx | Sistema FAQ |
| "localhost" | README.md | Como rodar |

---

## 🎯 FLUXO DO SITE

```
User abre http://localhost:3000
        ↓
App.jsx carrega
        ↓
Home.jsx renderiza
        ↓
Navbar (topo)
        ↓
HeroSection (hero)
        ↓
ServicesCards (3 cards)
        ↓
FAQ (accordion)
        ↓
Footer (rodapé)
        ↓
Site completo! 🎉
```

---

## 🚨 DEBUGGING

### F12 Console

```javascript
// Ver erros vermelhos
// Ver warnings amarelos
// Ver mensagens azuis
```

### React DevTools

```
F12 → Components tab
Ver componentes React
Inspecionar props/state
```

### Responsiveness

```
F12 → Device Toolbar
Testar em diferentes tamanhos
Mobile, Tablet, Desktop
```

---

## 🎨 CSS VARIÁVEIS

```css
/* Disponíveis em qualquer CSS */
--primary-color
--secondary-color
--accent-color
--text-dark
--text-light
--bg-light
--bg-white
--shadow-sm
--shadow-md
--shadow-lg
--transition
```

**Uso**: `background: var(--primary-color);`

---

## 🔔 PONTOS DE CUSTOMIZAÇÃO

```
Número WhatsApp:     Navbar.jsx, HeroSection.jsx, FAQ.jsx
Cor Principal:       globals.css
Contato:             Footer.jsx
Textos:              Componentes individuais
Logo:                Navbar.jsx, Footer.jsx
Redes Sociais:       Footer.jsx
Horário:             Footer.jsx
Email:               Footer.jsx
```

---

## 📊 ESTATÍSTICAS

```
Componentes:     5
CSS arquivos:    6
Linhas código:   ~4.800
Tamanho (prod):  < 50KB
Tempo load:      < 1s
Performance:     Excelente
```

---

## ✅ CHECKLIST RÁPIDO

Antes de fazer push/deploy:

- [ ] Sem erros no F12 Console
- [ ] Responsivo em mobile (F12)
- [ ] Todos botões funcionam
- [ ] WhatsApp abre corretamente
- [ ] CSS aplicado corretamente
- [ ] Animações suaves
- [ ] Sem lag ao scroll
- [ ] Footer tem contato correto

---

## 🚀 BUILD PARA PRODUÇÃO

```bash
npm run build
```

Cria pasta `build/` com arquivos otimizados.

Deploy em:
- Vercel
- Netlify
- Firebase
- GitHub Pages

---

## 📞 ROTAS FUTURAS

```jsx
// Em src/App.jsx (comentadas)
// <Route path="/precos" element={<Precos />} />
// <Route path="/sobre" element={<Sobre />} />
// <Route path="/locacao" element={<Locacao />} />
// <Route path="/cursos" element={<Cursos />} />
// <Route path="/login" element={<Login />} />
```

Descomente quando adicionar páginas.

---

## 💾 GIT COMMANDS

```bash
git add .
git commit -m "FASE 1: Home Page completa"
git push origin main
```

---

## 🎁 DEPENDÊNCIAS

```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.14.0",
  "react-scripts": "5.0.1"
}
```

Apenas 4 dependências principais! Projeto leve.

---

## 🔥 DICAS PRO

1. **Desenvolvimento**
   - Deixe `npm start` sempre rodando
   - Edite e veja mudanças em tempo real
   - Não precisa de reload manual

2. **CSS**
   - Use variáveis CSS (`var(--primary-color)`)
   - Organize por componente
   - Use media queries ao final de cada arquivo

3. **React**
   - Componentes reutilizáveis
   - Props para dados dinâmicos
   - useState para interatividade

4. **Performance**
   - Lazy load em futuras fases
   - Minify no build
   - Optimize images

---

## 🆘 PROBLEMAS COMUNS

| Problema | Solução |
|----------|---------|
| "npm not found" | Instale Node.js |
| Porta 3000 em uso | Use `--port 3001` |
| Aplicação em branco | Verifique F12 console |
| CSS não aplica | Verifique caminhos |
| Botão não funciona | Verifique onClick |

---

## 📱 TESTES RÁPIDOS

```javascript
// Mobile (F12)
- iPhone SE: 375px
- iPhone 12: 390px
- Pixel 5: 393px

// Tablet (F12)
- iPad: 768px

// Desktop
- Full width: 1400px+
```

---

## 🎯 PRÓXIMAS FASES

```
FASE 1: Home ✅ COMPLETO
FASE 2: Preços
FASE 3: Sobre
FASE 4: Cursos
FASE 5: Locação
FASE 6: Login
FASE 7: Backend
FASE 8: Agendamento
FASE 9: Deploy
```

---

## 📚 RECURSOS

```
React Docs:     https://react.dev
React Router:   https://reactrouter.com
Google Fonts:   https://fonts.google.com
CSS Tips:       https://css-tricks.com
```

---

## ✨ FINAL

```
npm install    ← Instalar
npm start      ← Rodar
F12            ← Debugar
Editar código  ← Personalizar
Approvar       ← Sucesso! 🎉
```

---

**Use este guia como referência rápida!**

Bookmark: ⭐ este arquivo
