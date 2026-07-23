# ✅ TESTE E APROVAÇÃO - FASE 1

## 🧪 Roteiro de Testes Completo

Use este checklist para validar cada seção da página antes de aprovar.

---

## 🚀 PRÉ-TESTE

### ✓ Preparação

- [ ] Node.js instalado (verificar: `node --version`)
- [ ] npm instalado (verificar: `npm --version`)
- [ ] Pasta do projeto: `c:\Meus Projetos\Site-mrlaser`
- [ ] Terminal aberto nessa pasta

### ✓ Inicialização

```bash
npm install      # (primeira vez, vai demorar)
npm start        # Site abre em http://localhost:3000
```

**Tempo esperado**:
- npm install: 2-5 minutos (primeira vez)
- npm start: 30-60 segundos
- Site abre: automático no navegador

---

## 🎯 TESTE 1: NAVBAR/HEADER

### Desktop (F12 → Desktop)

- [ ] Logo "MR Laser" aparece no topo esquerdo
- [ ] Logo tem ícone ✨ ao lado
- [ ] Menu tem 6 links visíveis: Home, Preços, Sobre Mim, Locação, Cursos, Login
- [ ] Botão "💬 WhatsApp" aparece no topo direito com fundo dourado
- [ ] Navbar tem fundo com gradiente branco/off-white
- [ ] Menu tem sombra sutil embaixo

### Hover (passar mouse)

- [ ] Passar mouse em links muda cor para dourado
- [ ] Passar mouse em links aparece linha dourada na base
- [ ] Botão WhatsApp sobe 3px ao passar mouse
- [ ] Botão WhatsApp aumenta sombra ao passar mouse

### Mobile (F12 → Devices → iPhone SE)

- [ ] Logo aparece reduzido à esquerda
- [ ] Botão "WhatsApp" desaparece do menu (vai para baixo)
- [ ] Aparece ícone ☰ (hamburger) no topo direito
- [ ] Clicar no ☰ abre menu lateral
- [ ] Menu lateral mostra 6 links em coluna
- [ ] Clicar em um link fecha o menu
- [ ] Clicar no ☰ novamente fecha o menu

### Clique em Links

- [ ] Home → scroll suave para topo
- [ ] Preços → (página não existe, link preparado)
- [ ] Sobre Mim → (página não existe, link preparado)
- [ ] Locação → (página não existe, link preparado)
- [ ] Cursos → (página não existe, link preparado)
- [ ] Login → (página não existe, link preparado)

**Resultado esperado**: Menu desaparece do console, nenhum erro (F12 Console)

---

## 🎯 TESTE 2: HERO SECTION

### Conteúdo Visual

- [ ] Título grande: "Depilação a Laser" com "Personalizada" em dourado
- [ ] Subtítulo em texto médio explicando tecnologia Hakon 4D
- [ ] 3 Features com checkmarks: "Depilação Permanente", "Painless Technology", "Todos os Tons de Pele"
- [ ] 2 Botões: "Agendar Avaliação Gratuita" (dourado) e "Saber Mais" (branco)
- [ ] Ícone 🔆 no lado direito flutuando (animação suave)
- [ ] Indicador "Descubra nossos serviços" com seta piscando na base

### Animações

- [ ] Ao carregar a página:
  - Título desliza vindo da esquerda
  - Subtítulo desliza depois (com delay)
  - Features deslizam depois
  - Botões deslizam depois
  - Ícone desliza vindo da direita
- [ ] Ícone bate flutuando continuamente
- [ ] Seta piscante se movimenta para baixo e volta

### Responsividade

- [ ] Desktop (1400+): Layout 2 colunas (texto + imagem lado a lado)
- [ ] Tablet (768-1024): Ainda 2 colunas, um pouco mais comprimido
- [ ] Mobile (< 768): Layout 1 coluna (texto acima, imagem abaixo)
- [ ] Smartphone (< 480): Tudo em 1 coluna, tamanho reduzido
- [ ] Em mobile: Seta piscante desaparece

### Botões

- [ ] "Agendar Avaliação Gratuita":
  - Clica → Abre WhatsApp web
  - Tem mensagem pré-preenchida
  - Abre em nova aba
- [ ] "Saber Mais":
  - Clica → (função preparada, sem erro)

---

## 🎯 TESTE 3: SERVICES CARDS (3 Pilares)

### Layout

- [ ] Desktop (1400+): 3 cards lado a lado
- [ ] Tablet (1024): Ainda 3 colunas, mais comprimidas
- [ ] Mobile (< 768): 1 card por linha
- [ ] Smartphone (< 480): Cards com padding reduzido

### Card 1: Clínica de Estética

- [ ] Ícone 💇‍♀️ aparece dentro de caixa beige
- [ ] Título: "Clínica de Estética"
- [ ] Descrição sobre depilação a laser personalizada
- [ ] 3 Features: "Tecnologia Hakon 4D", "Painless", "Resultado Permanente"
- [ ] Botão: "Conhecer Serviços →"

### Card 2: Cursos Profissionalizantes

- [ ] Ícone 🎓
- [ ] Título: "Cursos Profissionalizantes"
- [ ] Descrição sobre capacitação
- [ ] 3 Features: "Certificação Profissional", "Hands-on Training", "Mercado em Expansão"
- [ ] Botão: "Saber Mais sobre Cursos →"

### Card 3: Locação Hakon 4D

- [ ] Ícone 🔧
- [ ] Título: "Locação Hakon 4D"
- [ ] Descrição sobre aluguel de equipamento
- [ ] 3 Features: "Equipamento Premium", "Suporte Técnico", "Flexibilidade de Prazo"
- [ ] Botão: "Solicitar Orçamento →"

### Hover Effects

- [ ] Passar mouse em card:
  - Card sobe 10px
  - Sombra aumenta
  - Borda fica dourada
  - Ícone aumenta de tamanho
  - Ícone rotaciona 5 graus
  - Linha dourada aparece no topo (animate)

### Animação de Entrada

- [ ] Card 1 aparece com delay 0ms
- [ ] Card 2 aparece com delay 100ms
- [ ] Card 3 aparece com delay 200ms
- [ ] Todos deslizam de baixo para cima

---

## 🎯 TESTE 4: FAQ ACCORDION

### Estrutura

- [ ] Título: "Perguntas Frequentes"
- [ ] Subtítulo: "Tudo o que você precisa saber..."
- [ ] Desktop (1400+): 2 colunas (FAQ + Info Box)
- [ ] Mobile: 1 coluna (FAQ, depois Info Box)

### 4 Perguntas

#### Pergunta 1: "A depilação a laser dói?"
- [ ] Título aparece em branco
- [ ] Ícone ▼ no lado direito
- [ ] Clicar expande
- [ ] Resposta aparece com animação (slideDown)
- [ ] Ícone rotaciona para cima ▲
- [ ] Fundo do header muda para dourado
- [ ] Clicar novamente colapsa
- [ ] Tudo retorna ao normal com animação

#### Pergunta 2: "Quantas sessões são necessárias?"
- [ ] Fechada por padrão
- [ ] Mesmos efeitos ao abrir/fechar

#### Pergunta 3: "A depilação é realmente permanente?"
- [ ] Fechada por padrão
- [ ] Mesmos efeitos ao abrir/fechar

#### Pergunta 4: "Qual é o diferencial do Hakon 4D?"
- [ ] Fechada por padrão
- [ ] Mesmos efeitos ao abrir/fechar

### Info Box (Lado direito em desktop)

- [ ] Fundo com gradiente dourado
- [ ] Título: "Ainda tem dúvidas?"
- [ ] Texto explicativo
- [ ] Botão: "Falar com Especialista"
- [ ] Botão clica → Abre WhatsApp

### Interatividade

- [ ] Abrir pergunta 1
- [ ] Abrir pergunta 2 → pergunta 1 fecha
- [ ] Abrir pergunta 1 novamente → pergunta 2 fecha
- [ ] Só uma pergunta pode estar aberta por vez
- [ ] Clicar na mesma pergunta aberta → fecha

### Mobile

- [ ] Info Box aparece abaixo em mobile
- [ ] Botão "Falar Especialista" é full-width

---

## 🎯 TESTE 5: FOOTER

### Coluna 1: Logo + Sobre

- [ ] Logo "MR Laser" com ícone
- [ ] Descrição da marca (texto)
- [ ] 4 Ícones de redes sociais com cores douradas
- [ ] Passar mouse em ícone → sobe 5px
- [ ] Ícone: 📷 Instagram, 👍 Facebook, 💬 WhatsApp, 💼 LinkedIn

### Coluna 2: Links Rápidos

- [ ] Título: "Links Rápidos"
- [ ] 5 Links: Home, Serviços, FAQ, Preços, Sobre Mim
- [ ] Passar mouse em link → fica dourado e tem 0.5rem de padding esquerdo

### Coluna 3: Nossos Pilares

- [ ] Título: "Nossos Pilares"
- [ ] 3 Links: Clínica de Estética, Cursos Profissionalizantes, Locação Hakon 4D
- [ ] Mesmo hover effect que Coluna 2

### Coluna 4: Contato & Localização

- [ ] Título: "Contato & Localização"
- [ ] 4 Itens de contato:
  1. 📍 Endereço: "Av. Paulista, 1000 - São Paulo, SP CEP: 01311-100"
  2. 📱 WhatsApp: "(11) 9 8765-4321"
  3. ✉️ Email: "contato@mrlaser.com.br"
  4. 🕐 Horário: "Seg-Sex: 9h-19h Sab: 9h-15h"

### Bottom Section

- [ ] Linha divisória dourada separando conteúdo
- [ ] Esquerda: Copyright "© 2026 MR Laser Concept. Todos os direitos reservados."
- [ ] Direita: 3 Links legais: "Política de Privacidade • Termos de Serviço • Cookies"

### Responsividade

- [ ] Desktop (1400+): 4 colunas lado a lado
- [ ] Tablet (1024): Talvez 2 colunas
- [ ] Mobile (< 768): 1 coluna vertical
- [ ] Footer inteiro responsivo sem quebras

### Fundo e Estilo

- [ ] Fundo: Gradiente preto (escuro)
- [ ] Texto: Branco/cinza claro
- [ ] Sombra decorativa no topo

---

## 🎯 TESTE 6: RESPONSIVIDADE GERAL

### Desktop - F12 Desktop

- [ ] Acessar http://localhost:3000
- [ ] Pressionar F12
- [ ] Tudo funciona perfeitamente
- [ ] Nenhuma barra lateral de scroll horizontal
- [ ] Tamanho máximo de conteúdo é respeitado

### Tablet - F12 iPad (768px)

- [ ] Navbar compacta mas visível
- [ ] Hero Section em 1 coluna
- [ ] Services Cards em 1 ou 2 colunas
- [ ] FAQ com Info Box abaixo
- [ ] Footer em 2 colunas
- [ ] Sem scroll horizontal

### Mobile - F12 iPhone SE (375px)

- [ ] Hamburger menu funcional
- [ ] Todo conteúdo em 1 coluna
- [ ] Botões full-width
- [ ] Textos legíveis (não muito pequeno)
- [ ] Sem problemas de layout
- [ ] Sem scroll horizontal

### Landscape (Virar celular)

- [ ] F12 → Ligar landscape (com iPhone)
- [ ] Layout se adapta
- [ ] Nada quebra

---

## 🎯 TESTE 7: CORES E DESIGN

### Cores Esperadas

- [ ] Dourado primário: `#d4af37` (nos botões, links, destaques)
- [ ] Preto escuro: `#1a1a1a` (texto, fundo footer)
- [ ] Bege premium: `#e8d5b7` (acentos, fundos)
- [ ] Off-white: `#f8f8f8` (fundo geral)
- [ ] Branco: `#ffffff` (cards)

### Tipografia

- [ ] Título H1: Grande (3rem), peso 800, negrito
- [ ] Títulos H2: Médio (2.5rem), peso 700
- [ ] Títulos H3: Pequeno (1.5rem), peso 700
- [ ] Corpo: Legível, peso 400-600
- [ ] Fonte: Poppins (Google Fonts)

### Sombras

- [ ] Cards têm sombra sutil
- [ ] Ao hover, sombra aumenta
- [ ] Botões têm sombra decorativa
- [ ] Efeito visual sofisticado

### Gradientes

- [ ] Navbar: Branco → Off-white
- [ ] Hero Título: Preto → Dourado
- [ ] Botões: Dourado → Dourado escuro
- [ ] Info Box FAQ: Dourado → Dourado escuro
- [ ] Footer: Preto escuro → Preto

---

## 🎯 TESTE 8: PERFORMANCE

### Console (F12)

- [ ] Sem erros vermelhos
- [ ] Sem warnings amarelos graves
- [ ] Mensagens informativas OK

### Velocidade

- [ ] Site carrega em < 1 segundo
- [ ] Cliques em botões respondem imediatamente
- [ ] Scroll é suave (sem lag)
- [ ] Animações são fluidas

### Recursos

- [ ] Não usa muita memória
- [ ] CPU normal durante uso
- [ ] Sem consumo excessivo de bateria (em mobile)

---

## 🎯 TESTE 9: FUNCIONALIDADES CTA

### Botão "Agendar Avaliação" (Hero)

- [ ] Clica → Abre WhatsApp web
- [ ] URL é: `https://wa.me/5511987654321`
- [ ] Aparece mensagem pré-preenchida
- [ ] Abre em nova aba
- [ ] Número é: `5511987654321` (São Paulo)
- **NOTA**: Este é número de exemplo, pode ser customizado

### Botão "💬 WhatsApp" (Navbar)

- [ ] Mesmo comportamento acima

### Botão "Falar com Especialista" (FAQ)

- [ ] Mesmo comportamento acima

### Botão "Saber Mais" (Hero)

- [ ] Clica → Sem erro (está preparado)

---

## 🎯 TESTE 10: LINKS PREPARADOS

Esses links devem estar preparados (não funcionam, mas sem erros):

- [ ] #precos → Preparado para Página de Preços
- [ ] #sobre → Preparado para Página Sobre
- [ ] #locacao → Preparado para Página Locação
- [ ] #cursos → Preparado para Página Cursos
- [ ] #login → Preparado para Página Login

**Esperado**: Nenhum erro no console ao clicar

---

## ✅ CHECKLIST FINAL DE APROVAÇÃO

Marque como ✅ quando tudo passar:

```
NAVBAR
  ☐ Logo visível
  ☐ Menu com 6 links
  ☐ Botão WhatsApp funciona
  ☐ Hamburger menu no mobile
  ☐ Hover effects funcionam

HERO SECTION
  ☐ Título com gradiente
  ☐ Subtítulo legível
  ☐ 3 Features aparecem
  ☐ 2 Botões funcionam
  ☐ Animações suaves
  ☐ Responsivo em mobile

SERVICES CARDS
  ☐ 3 Cards aparecem
  ☐ Desktop: 3 colunas
  ☐ Mobile: 1 coluna
  ☐ Hover effects funcionam
  ☐ Botões preparados

FAQ
  ☐ 4 Perguntas aparecem
  ☐ Accordion abre/fecha
  ☐ Animações funcionam
  ☐ Info box aparece
  ☐ Botão CTA funciona

FOOTER
  ☐ 4 Colunas aparecem
  ☐ Contato visível
  ☐ Redes sociais funcionam
  ☐ Links legais presentes
  ☐ Copyright automático

GERAL
  ☐ Sem erros no console
  ☐ Carregamento rápido
  ☐ Responsivo (todas resoluções)
  ☐ Cores sofisticadas
  ☐ Design premium
  ☐ Todas animações suaves
```

---

## 🎯 Resultado

Se **TODOS os checkboxes estão marcados ✅**, então a **FASE 1 está aprovada!** 🎉

Parabéns! Seu site profissional está pronto para testes iniciais.

---

## 📞 Próximo Passo

Após aprovação, começamos:
- **FASE 2**: Página de Preços

Qualquer dúvida durante testes, é só chamar! 📞

---

**Desenvolvido com ❤️ para MR Laser Concept**

Data: 10/07/2026
