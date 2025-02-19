interface PossibleModule {
  description: string;
  name: string;
  isExtraContent: boolean;
  lessons: {
    // each module has 2-4 lessons
    name: string;
    content: string;
    contentType: 'MDX' | 'VIDEO';
    order: number;
  }[];
}
const possibleModule: PossibleModule[] = [
  {
    description: 'Este é um módulo introdutório sobre o assunto.',
    name: 'Introdução',
    isExtraContent: false,
    lessons: [
      {
        name: 'Introdução ao Assunto',
        content: `
---
title: Introdução ao Assunto
description: Esta é uma lição introdutória em MDX.
---

# Introdução ao Assunto

Bem-vindo à introdução ao assunto. Aqui você aprenderá os conceitos básicos.

## Tópicos Cobertos

- O que é o assunto?
- Por que é importante?
- Como começar?

## Exemplo de Código

\`\`\`typescript
console.log('Bem-vindo à introdução ao assunto!');
\`\`\`
`,
        contentType: 'MDX',
        order: 1,
      },
      {
        name: 'Visão Geral',
        content:
          'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm',
        contentType: 'VIDEO',
        order: 2,
      },
    ],
  },
  {
    description: 'Neste módulo, exploraremos conceitos avançados.',
    name: 'Conceitos Avançados',
    isExtraContent: false,
    lessons: [
      {
        name: 'Conceito Avançado 1',
        content: `
---
title: Conceito Avançado 1
description: Esta é uma lição sobre conceito avançado 1 em MDX.
---

# Conceito Avançado 1

Aqui você aprenderá sobre o conceito avançado 1.

## Tópicos Cobertos

- Detalhes do conceito
- Aplicações práticas
- Exemplos avançados

## Exemplo de Código

\`\`\`typescript
console.log('Explorando o conceito avançado 1');
\`\`\`
`,
        contentType: 'MDX',
        order: 1,
      },
      {
        name: 'Conceito Avançado 2',
        content:
          'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm',
        contentType: 'VIDEO',
        order: 2,
      },
    ],
  },
  {
    description: 'Este módulo cobre tópicos intermediários.',
    name: 'Tópicos Intermediários',
    isExtraContent: false,
    lessons: [
      {
        name: 'Tópico Intermediário 1',
        content: `
---
title: Tópico Intermediário 1
description: Esta é uma lição sobre tópico intermediário 1 em MDX.
---

# Tópico Intermediário 1

Aqui você aprenderá sobre o tópico intermediário 1.

## Tópicos Cobertos

- Introdução ao tópico
- Exemplos intermediários
- Aplicações práticas

## Exemplo de Código

\`\`\`typescript
console.log('Aprendendo sobre o tópico intermediário 1');
\`\`\`
`,
        contentType: 'MDX',
        order: 1,
      },
      {
        name: 'Tópico Intermediário 2',
        content:
          'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm',
        contentType: 'VIDEO',
        order: 2,
      },
    ],
  },
  {
    description: 'Aprenda as bases fundamentais neste módulo.',
    name: 'Bases Fundamentais',
    isExtraContent: false,
    lessons: [
      {
        name: 'Base Fundamental 1',
        content: `
---
title: Base Fundamental 1
description: Esta é uma lição sobre base fundamental 1 em MDX.
---

# Base Fundamental 1

Aqui você aprenderá sobre a base fundamental 1.

## Tópicos Cobertos

- Fundamentos básicos
- Exemplos práticos
- Aplicações iniciais

## Exemplo de Código

\`\`\`typescript
console.log('Estudando a base fundamental 1');
\`\`\`
`,
        contentType: 'MDX',
        order: 1,
      },
      {
        name: 'Base Fundamental 2',
        content:
          'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm',
        contentType: 'VIDEO',
        order: 2,
      },
    ],
  },
  {
    description: 'Este módulo oferece conteúdo extra para aprofundamento.',
    name: 'Conteúdo Extra',
    isExtraContent: true,
    lessons: [
      {
        name: 'Conteúdo Extra 1',
        content: `
---
title: Conteúdo Extra 1
description: Esta é uma lição sobre conteúdo extra 1 em MDX.
---

# Conteúdo Extra 1

Aqui você aprenderá sobre o conteúdo extra 1.

## Tópicos Cobertos

- Detalhes adicionais
- Exemplos avançados
- Aplicações práticas

## Exemplo de Código

\`\`\`typescript
console.log('Explorando o conteúdo extra 1');
\`\`\`
`,
        contentType: 'MDX',
        order: 1,
      },
      {
        name: 'Conteúdo Extra 2',
        content:
          'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm',
        contentType: 'VIDEO',
        order: 2,
      },
    ],
  },
  {
    description: 'Um módulo dedicado a práticas e exercícios.',
    name: 'Práticas e Exercícios',
    isExtraContent: false,
    lessons: [
      {
        name: 'Prática 1',
        content: `
---
title: Prática 1
description: Esta é uma lição sobre prática 1 em MDX.
---

# Prática 1

Aqui você aprenderá sobre a prática 1.

## Tópicos Cobertos

- Exercícios práticos
- Exemplos de aplicação
- Desafios

## Exemplo de Código

\`\`\`typescript
console.log('Realizando a prática 1');
\`\`\`
`,
        contentType: 'MDX',
        order: 1,
      },
      {
        name: 'Exercício 1',
        content:
          'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm',
        contentType: 'VIDEO',
        order: 2,
      },
    ],
  },
  {
    description: 'Exploração detalhada de casos de uso neste módulo.',
    name: 'Casos de Uso',
    isExtraContent: false,
    lessons: [
      {
        name: 'Caso de Uso 1',
        content: `
---
title: Caso de Uso 1
description: Esta é uma lição sobre caso de uso 1 em MDX.
---

# Caso de Uso 1

Aqui você aprenderá sobre o caso de uso 1.

## Tópicos Cobertos

- Exemplos de casos de uso
- Aplicações práticas
- Análise detalhada

## Exemplo de Código

\`\`\`typescript
console.log('Estudando o caso de uso 1');
\`\`\`
`,
        contentType: 'MDX',
        order: 1,
      },
      {
        name: 'Caso de Uso 2',
        content:
          'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm',
        contentType: 'VIDEO',
        order: 2,
      },
    ],
  },
  {
    description: 'Módulo focado em técnicas e melhores práticas.',
    name: 'Técnicas e Melhores Práticas',
    isExtraContent: false,
    lessons: [
      {
        name: 'Técnica 1',
        content: `
---
title: Técnica 1
description: Esta é uma lição sobre técnica 1 em MDX.
---

# Técnica 1

Aqui você aprenderá sobre a técnica 1.

## Tópicos Cobertos

- Técnicas avançadas
- Melhores práticas
- Exemplos práticos

## Exemplo de Código

\`\`\`typescript
console.log('Aprendendo a técnica 1');
\`\`\`
`,
        contentType: 'MDX',
        order: 1,
      },
      {
        name: 'Melhor Prática 1',
        content:
          'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm',
        contentType: 'VIDEO',
        order: 2,
      },
    ],
  },
  {
    description: 'Conteúdo especializado para profissionais neste módulo.',
    name: 'Conteúdo Especializado',
    isExtraContent: false,
    lessons: [
      {
        name: 'Especialização 1',
        content: `
---
title: Especialização 1
description: Esta é uma lição sobre especialização 1 em MDX.
---

# Especialização 1

Aqui você aprenderá sobre a especialização 1.

## Tópicos Cobertos

- Detalhes especializados
- Exemplos avançados
- Aplicações práticas

## Exemplo de Código

\`\`\`typescript
console.log('Explorando a especialização 1');
\`\`\`
`,
        contentType: 'MDX',
        order: 1,
      },
      {
        name: 'Especialização 2',
        content:
          'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm',
        contentType: 'VIDEO',
        order: 2,
      },
    ],
  },
  {
    description: 'Este módulo inclui estudos de caso e exemplos práticos.',
    name: 'Estudos de Caso',
    isExtraContent: false,
    lessons: [
      {
        name: 'Estudo de Caso 1',
        content: `
---
title: Estudo de Caso 1
description: Esta é uma lição sobre estudo de caso 1 em MDX.
---

# Estudo de Caso 1

Aqui você aprenderá sobre o estudo de caso 1.

## Tópicos Cobertos

- Análise de casos de uso
- Exemplos práticos
- Aplicações detalhadas

## Exemplo de Código

\`\`\`typescript
console.log('Analisando o estudo de caso 1');
\`\`\`
`,
        contentType: 'MDX',
        order: 1,
      },
      {
        name: 'Exemplo Prático 1',
        content:
          'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm',
        contentType: 'VIDEO',
        order: 2,
      },
    ],
  },
];

type PossibleModuleCombination = (PossibleModule & { order: number })[];
export const possibleModuleCombinations: PossibleModuleCombination[] = [
  [
    { ...possibleModule[0], order: 1 }, // Introdução
    { ...possibleModule[3], order: 2 }, // Bases Fundamentais
    { ...possibleModule[2], order: 3 }, // Tópicos Intermediários
    { ...possibleModule[1], order: 4 }, // Conceitos Avançados
  ],
  [
    { ...possibleModule[0], order: 1 }, // Introdução
    { ...possibleModule[4], order: 2 }, // Conteúdo Extra
    { ...possibleModule[5], order: 3 }, // Práticas e Exercícios
    { ...possibleModule[6], order: 4 }, // Casos de Uso
  ],
  [
    { ...possibleModule[0], order: 1 }, // Introdução
    { ...possibleModule[7], order: 2 }, // Técnicas e Melhores Práticas
    { ...possibleModule[8], order: 3 }, // Conteúdo Especializado
    { ...possibleModule[9], order: 4 }, // Estudos de Caso
  ],
];
