# 📐 GUIA VISUAL - ESTRUTURA DA HOME PAGE

## Layout da Página (Verticamente)

```
┌─────────────────────────────────────────────────────┐
│                    NAVBAR/HEADER                     │
│  Logo  | Home | Preços | Sobre | Locação | Cursos  │
│                              [💬 WhatsApp]           │
└─────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│                   HERO SECTION                       │
│                                                      │
│   Depilação a Laser Personalizada                    │
│   Subtítulo persuasivo sobre tecnologia             │
│                                                      │
│   ✓ Depilação Permanente                           │
│   ✓ Painless Technology                            │
│   ✓ Todos os Tons de Pele                          │
│                                                      │
│  [Agendar Avaliação]  [Saber Mais]                 │
│                                                      │
│                        🔆  (com animação)           │
│                        ↓   (scroll indicator)       │
└─────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│             SERVICES - 3 PILARES (CARDS)            │
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│  │   💇‍♀️    │  │   🎓     │  │   🔧    │         │
│  │ Clínica  │  │ Cursos   │  │ Locação  │         │
│  │          │  │          │  │          │         │
│  │ Descrição│  │Descrição │  │Descrição │         │
│  │ • Hakon  │  │ • Certif │  │ • Premium│         │
│  │ • Painl  │  │ • Hands- │  │ • Suporte│         │
│  │ • Perman │  │ • Mercad │  │ • Flexib │         │
│  │          │  │          │  │          │         │
│  │[Saber +] │  │[Saber +] │  │[Saber +] │         │
│  └──────────┘  └──────────┘  └──────────┘         │
└─────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│                FAQ - PERGUNTAS E RESPOSTAS          │
│                                                      │
│  ┌──────────────────────────────────────┐          │
│  │ Q: A depilação a laser dói?    [∨]  │          │
│  │ R: Não! A tecnologia... (expandido) │          │
│  └──────────────────────────────────────┘          │
│                                                      │
│  ┌──────────────────────────────────────┐          │
│  │ Q: Quantas sessões? (fechado) [>]   │          │
│  └──────────────────────────────────────┘          │
│                                                      │
│  ┌──────────────────────────────────────┐          │
│  │ Q: É realmente permanente? [>]      │          │
│  └──────────────────────────────────────┘          │
│                                                      │
│  ┌──────────────────────────────────────┐          │
│  │ Q: Qual o diferencial? [>]          │          │
│  └──────────────────────────────────────┘          │
│                     │                                │
│        ┌────────────┴────────────┐                 │
│        │                         │                 │
│        ▼                         ▼                 │
│   [FAQ Content]    [Ainda tem dúvidas?]           │
│                    [Falar Especialista]           │
└─────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│                    FOOTER                            │
│                                                      │
│  Logo  │ Links  │ Serviços │ Contato               │
│  Desc  │ Home   │ Clínica  │ 📍 Endereço           │
│  ©     │ Preços │ Cursos   │ 📱 WhatsApp           │
│ Social │ Sobre  │ Locação  │ ✉️  Email            │
│        │ FAQ    │          │ 🕐 Horário           │
│                                                      │
│  Política | Termos | Cookies                       │
└─────────────────────────────────────────────────────┘
```

---

## Componentes e Hierarquia

```
App.jsx
├── Navbar
│   ├── Logo
│   ├── NavLinks (Home, Preços, Sobre, Locação, Cursos, Login)
│   ├── HamburgerMenu (Mobile)
│   └── CTAButton (WhatsApp)
│
├── HeroSection
│   ├── Title com Gradient
│   ├── Subtitle
│   ├── FeaturesList
│   ├── Buttons (Primary & Secondary)
│   ├── ImagePlaceholder (com animação)
│   └── ScrollIndicator
│
├── ServicesCards
│   ├── SectionHeader
│   └── ServiceCard[] x3
│       ├── Icon
│       ├── Title
│       ├── Description
│       ├── Features
│       └── Button
│
├── FAQ
│   ├── SectionHeader
│   ├── Accordion
│   │   └── AccordionItem[] x4
│   │       ├── Header (Pergunta)
│   │       └── Content (Resposta - animado)
│   └── InfoBox
│       └── CTAButton
│
└── Footer
    ├── Column1 (Logo + Social)
    ├── Column2 (Links)
    ├── Column3 (Serviços)
    └── Column4 (Contato)
```

---

## Estilos e Responsividade

### Breakpoints
```
┌─────────────────────────────────────────┐
│         RESPONSIVIDADE QUEBRAS          │
├─────────────────────────────────────────┤
│  < 480px     │ Smartphone Mini          │
├─────────────────────────────────────────┤
│  480-768px   │ Mobile Pequeno/Médio     │
├─────────────────────────────────────────┤
│  768-1024px  │ Tablet                   │
├─────────────────────────────────────────┤
│  1024-1400px │ Desktop Pequeno          │
├─────────────────────────────────────────┤
│  1400px+     │ Desktop Grande           │
└─────────────────────────────────────────┘
```

### Paleta de Cores
```
┌──────────────────────────────────────────┐
│            CORES DO PROJETO              │
├──────────────────────────────────────────┤
│ 🟡 Dourado Principal  │ #d4af37          │
├──────────────────────────────────────────┤
│ ⬛ Preto Escuro      │ #1a1a1a          │
├──────────────────────────────────────────┤
│ 🟠 Bege Premium      │ #e8d5b7          │
├──────────────────────────────────────────┤
│ ⚪ Off-White        │ #f8f8f8          │
├──────────────────────────────────────────┤
│ ⚪ Branco            │ #ffffff          │
├──────────────────────────────────────────┤
│ 🔵 Acentos           │ #555555, #666666 │
└──────────────────────────────────────────┘
```

---

## Animações Implementadas

### 1. Hero Section
```
Entrada:
  - Title: Slide-in from left (0.8s)
  - Subtitle: Slide-in from left + delay (0.8s)
  - Features: Slide-in from left + delay (0.8s)
  - Buttons: Slide-in from left + delay (0.8s)
  - Image: Slide-in from right (0.8s)
  
Contínua:
  - Image: Float up/down (3s infinite)
  - Scroll Indicator: Bounce (2s infinite)
```

### 2. Services Cards
```
Entrada:
  - Cards: Slide-up com stagger (0.6s + delay por índice)
  
Hover:
  - Card: Translate Y -10px (0.3s)
  - Icon: Scale 1.1 + rotate 5deg (0.3s)
  - Border: Golden color (0.3s)
  - Shadow: Aumenta (0.3s)
  
Topbar:
  - Animation: ScaleX 0→1 from left (0.6s)
```

### 3. FAQ Accordion
```
Abrir:
  - Icon: Rotate 180deg (0.3s)
  - Content: SlideDown (0.3s)
  - Background: Color change (0.3s)
  - Max-height: 0 → 500px (0.3s)
  
Fechar:
  - Tudo reverso (0.3s)
```

### 4. Footer
```
Entrada:
  - FadeIn (0.8s)
```

---

## Estrutura CSS

```
styles/
├── globals.css          Variables + resets globais
├── Navbar.css          Navbar responsiva
├── HeroSection.css     Hero com animations
├── ServicesCards.css   Cards com hover effects
├── FAQ.css             Accordion com animations
└── Footer.css          Footer responsivo
```

### Variáveis CSS Globais
```css
:root {
  --primary-color: #d4af37;
  --secondary-color: #1a1a1a;
  --accent-color: #e8d5b7;
  --text-dark: #1a1a1a;
  --text-light: #f8f8f8;
  --bg-light: #f8f8f8;
  --bg-white: #ffffff;
  --shadow-sm: 0 2px 8px rgba(0,0,0,0.1);
  --shadow-md: 0 4px 16px rgba(0,0,0,0.15);
  --shadow-lg: 0 10px 30px rgba(0,0,0,0.2);
  --transition: all 0.3s ease-in-out;
}
```

---

## Fluxo de Navegação

```
                        ┌─────────────────┐
                        │   Visitante     │
                        │  Chega no Site  │
                        └────────┬────────┘
                                 │
                    ┌────────────▼────────────┐
                    │   Vê a Navbar           │
                    │   (Menu Principal)      │
                    └────────────┬────────────┘
                                 │
        ┌────────────────────────┼────────────────────────┐
        │                        │                        │
    Clica em            Clica em Home              Clica em
    WhatsApp            (Scroll suave)            Outro Link*
        │                        │                        │
        │                        │                        │
        ▼                        ▼                        ▼
    WhatsApp              Vê Hero Section          * Página não existe
    Abre                  (Impactante)             (Links preparados)
                               │
                               ▼
                      Descobre 3 Pilares
                         (Clínica,
                      Cursos, Locação)
                               │
                               ▼
                         Vê FAQ Section
                      (Tira suas dúvidas)
                               │
                               ▼
                           Vê Footer
                        (Dados de contato)
                               │
                               ▼
                      Clica em Contato
                      ou WhatsApp (CTA)
                               │
                               ▼
                      🎉 Conversion!
```

---

## Mobile vs Desktop

### Desktop (1400px+)
```
┌────────────────────────────────────────┐
│ Logo | Menu Links | [💬 WhatsApp]     │ ← Navbar
└────────────────────────────────────────┘
┌────────────────────────────────────────┐
│ Título Grande                │   Ícone │ ← Hero (2 colunas)
│ Subtítulo                    │  (Float)│
│ Features (3 linhas)          │         │
│ [Botão 1] [Botão 2]         │         │
└────────────────────────────────────────┘
┌────────────────────────────────────────┐
│ [Card] [Card] [Card]                   │ ← Services (3 colunas)
└────────────────────────────────────────┘
┌────────────────────────────────────────┐
│ [FAQ Accordion] │ [Info Box]            │ ← FAQ (2 colunas)
└────────────────────────────────────────┘
```

### Mobile (<768px)
```
┌──────────────────┐
│ Logo      [≡]    │ ← Navbar com hamburger
└──────────────────┘
┌──────────────────┐
│ Título Grande    │ ← Hero (1 coluna)
│ Subtítulo        │
│ Features         │
│ [Botões Stack]   │
│ Ícone            │
└──────────────────┘
┌──────────────────┐
│ [Card]           │ ← Services (1 coluna)
│ [Card]           │
│ [Card]           │
└──────────────────┘
┌──────────────────┐
│ [FAQ Accordion]  │ ← FAQ (1 coluna)
│ [Info Box]       │
└──────────────────┘
```

---

## Status do Projeto

```
✅ IMPLEMENTADO:
  • Navbar responsiva
  • Hero Section
  • Services Cards (3 pilares)
  • FAQ com Accordion
  • Footer completo
  • Design Premium
  • Responsividade total
  • Animações suaves
  • Código limpo

⏳ FUTURO (Próximas Fases):
  • Página Preços
  • Página Sobre
  • Página Cursos
  • Página Locação
  • Sistema de Login
  • Backend Supabase
  • Agendamento Online
  • Blog/Conteúdo
  • Deploy
```

---

**Este é o guia visual de como tudo está estruturado. Pronto para testar! 🚀**
