# ⚙️ CONFIGURAÇÕES E CUSTOMIZAÇÕES - FASE 1

## 🔧 Variáveis Fáceis de Editar

### 1. Cores do Site

Arquivo: `src/styles/globals.css`

```css
:root {
  /* Mudar a cor dourada principal */
  --primary-color: #d4af37;      /* ← Troque aqui por uma cor Hex */
  
  /* Cores alternativas sugeridas para estética: */
  /* Rose Gold: #B76E79 */
  /* Copper: #B87333 */
  /* Champagne: #F1E4C3 */
  /* Rose: #F64A8A */
}
```

### 2. Número de WhatsApp

Localizações:
- `src/components/Navbar.jsx` - Linha com `wa.me`
- `src/components/HeroSection.jsx` - Linha com `wa.me`
- `src/components/FAQ.jsx` - Linha com `wa.me`

Procure por: `https://wa.me/5511987654321`

Substitua `5511987654321` por:
- **Sua área**: 11 (São Paulo), 21 (Rio), 85 (Ceará), etc.
- **Seu número**: Sem hífen, sem parênteses
- **Exemplo para (11) 98765-4321**: `5511987654321`

### 3. Informações do Footer

Arquivo: `src/components/Footer.jsx`

```jsx
// Endereço
"Av. Paulista, 1000 - São Paulo, SP\nCEP: 01311-100"

// WhatsApp
"(11) 9 8765-4321"

// Email
"contato@mrlaser.com.br"

// Horário
"Seg-Sex: 9h-19h\nSab: 9h-15h"
```

### 4. Descrição da Marca

Arquivo: `src/components/Footer.jsx`

```jsx
"Depilação a laser personalizada com tecnologia Hakon 4D..."
```

### 5. Redes Sociais

Arquivo: `src/components/Footer.jsx`

Procure por:
```jsx
<a href="#" className="social-icon" title="Instagram">
```

Substitua `#` pelos links das redes:
- Instagram: `https://instagram.com/seu_usuario`
- Facebook: `https://facebook.com/sua_pagina`
- WhatsApp: `https://wa.me/seu_numero`
- LinkedIn: `https://linkedin.com/company/sua_empresa`

---

## 🎨 Personalizações de Design

### 1. Mudar Fonte

Arquivo: `public/index.html`

Atualmente usa: **Poppins** (Google Fonts)

Para mudar, substitua:
```html
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```

Outras fontes premium recomendadas:
- **Playfair Display**: `https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&display=swap`
- **Montserrat**: `https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&display=swap`
- **Inter**: `https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap`

Depois atualize `src/styles/globals.css`:
```css
body {
  font-family: 'NomeDANovaFonte', sans-serif;
}
```

### 2. Adicionar Logo

No lugar do ícone `✨` na Navbar/Footer, você pode:

1. **Substituir por imagem**:
```jsx
<img src="/logo.png" alt="Logo" className="logo-image" />
```

2. **Colocar no `public/` (criar pasta)**:
   - Adicione sua logo em `public/logo.png`

3. **Referenciar em qualquer lugar**:
```jsx
<img src="/logo.png" alt="MR Laser" />
```

### 3. Hero Section Image

Atualmente mostra um placeholder com emoji. Para adicionar imagem real:

Arquivo: `src/components/HeroSection.jsx`

```jsx
// Troque isto:
<div className="hero-image-placeholder">
  <span>🔆</span>
</div>

// Por isto:
<img src="/hero-image.jpg" alt="Depilação Laser" className="hero-image-img" />
```

E adicione CSS em `src/styles/HeroSection.css`:
```css
.hero-image-img {
  width: 100%;
  height: auto;
  border-radius: 20px;
  box-shadow: var(--shadow-lg);
  animation: float 3s ease-in-out infinite;
}
```

### 4. Mudar Tamanhos de Fonte

Arquivo: `src/styles/globals.css`

```css
h1 { font-size: 3rem; }      /* Grande */
h2 { font-size: 2.5rem; }    /* Médio */
h3 { font-size: 1.5rem; }    /* Pequeno */
```

### 5. Mudar Espaçamento

Procure por `padding:` ou `margin:` nos arquivos CSS e ajuste os valores.

---

## 📝 Textos Principais Para Editar

### Hero Section

Arquivo: `src/components/HeroSection.jsx`

```jsx
<h1 className="hero-title">
  Depilação a Laser
  <span className="highlight"> Personalizada</span>
</h1>

<p className="hero-subtitle">
  Tecnologia Hakon 4D de ponta combinada com expertise...
</p>
```

### FAQ Perguntas

Arquivo: `src/components/FAQ.jsx`

```jsx
const faqs = [
  {
    question: 'A depilação a laser dói?',
    answer: 'Não! A tecnologia Hakon 4D...'
  },
  // Adicione/remova perguntas aqui
];
```

### Services Cards

Arquivo: `src/components/ServicesCards.jsx`

```jsx
const services = [
  {
    title: 'Clínica de Estética',
    description: 'Depilação a laser personalizada...',
    features: ['Tecnologia Hakon 4D', 'Painless', 'Resultado Permanente'],
  },
  // Edite cada serviço aqui
];
```

---

## 🚀 Deploy Futuro (Quando Pronto)

### Criar versão de produção

```bash
npm run build
```

Isso cria uma pasta `build/` otimizada pronta para upload.

### Hosts recomendados:
- **Vercel** (melhor para React): https://vercel.com
- **Netlify**: https://netlify.com
- **Firebase**: https://firebase.google.com
- **GitHub Pages**: https://pages.github.com

---

## 🔐 Variáveis de Ambiente

Arquivo: `.env`

Crie este arquivo na raiz do projeto com suas configurações:

```env
REACT_APP_WHATSAPP_NUMBER=5511987654321
REACT_APP_EMAIL=contato@mrlaser.com.br
REACT_APP_SITE_URL=http://localhost:3000
```

Para usar em componentes:
```jsx
const whatsapp = process.env.REACT_APP_WHATSAPP_NUMBER;
```

---

## 📊 Analytics (Futuro)

Para rastrear visitantes, adicione Google Analytics:

1. Crie conta em: https://analytics.google.com
2. Pegue seu ID (formato: G-XXXXXXXXXX)
3. Instale: `npm install react-ga4`
4. Importe no `App.jsx`:

```jsx
import ReactGA from "react-ga4";

ReactGA.initialize("G-XXXXXXXXXX");
ReactGA.send("pageview");
```

---

## 🤖 Meta Tags e SEO

Arquivo: `public/index.html`

Já incluso:
```html
<meta name="description" content="MR Laser Concept - Depilação a Laser...">
```

Adicione mais para melhorar SEO:

```html
<meta name="keywords" content="depilação laser, hakon 4d, estética são paulo">
<meta property="og:title" content="MR Laser Concept">
<meta property="og:description" content="Depilação a Laser Personalizada">
<meta property="og:image" content="/logo.png">
<meta property="og:url" content="https://seu-site.com">
<meta name="twitter:card" content="summary_large_image">
```

---

## 🐛 Debug Mode

Para ver console erros:

1. Pressione `F12` no navegador
2. Vá para aba "Console"
3. Se houver erros, aparecerão em vermelho

Para logs do seu React:
```jsx
console.log('Valor:', variavel);
console.error('Erro:', erro);
console.warn('Aviso:', aviso);
```

---

## ⚡ Performance Tips

1. **Comprimir imagens**:
   - Use https://tinypng.com
   - Salve como WebP quando possível

2. **Lazy Loading** (futuro):
   ```jsx
   import { lazy, Suspense } from 'react';
   const FAQ = lazy(() => import('./components/FAQ'));
   
   <Suspense fallback={<div>Carregando...</div>}>
     <FAQ />
   </Suspense>
   ```

3. **Code Splitting** (automático no React Router)

4. **Minify CSS** (automático no `npm run build`)

---

## 🎯 Checklist de Customização

- [ ] Mudar número do WhatsApp
- [ ] Atualizar informações do Footer
- [ ] Adicionar links das redes sociais
- [ ] Adicionar logo (se tiver)
- [ ] Revisar todos os textos
- [ ] Testar em mobile
- [ ] Verificar links
- [ ] Testar botões CTA
- [ ] Revisar cores
- [ ] Testar responsividade

---

**Pronto para customizar! 🎨**
