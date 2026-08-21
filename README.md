# E-Learning & Course Distribution Platform

Plataforma full-stack de distribuição de cursos e gestão de alunos, desenvolvida para lidar com ingestão automatizada de compras, controle de acesso condicional e entrega de conteúdo em vídeo.

Este repositório contém o código-fonte da aplicação front-end/back-end (Next.js). A infraestrutura de banco de dados, proxy e orquestração de processos está configurada diretamente no servidor de produção.

## 🏗 Arquitetura e Stack Tecnológica

* **Framework Core:** Next.js (React Server Components), Node.js, TypeScript
* **Banco de Dados:** MySQL conteinerizado via Docker (gerenciado via servidor)
* **Autenticação:** Magic Link via Amazon SES (Simple Email Service)
* **Infraestrutura:** Ubuntu Server, Nginx (Reverse Proxy), PM2 (Process Manager)
* **Integrações:** Webhooks (CartPanda) para automação de checkout, Bunny.net API para streaming de vídeo.

## ⚙️ Principais Desafios e Decisões de Engenharia

### 1. Ingestão de Webhooks e Automação de Acesso
Em vez de implementar um fluxo de pagamento complexo do zero, o sistema atua como um microsserviço que escuta webhooks disparados pelo CartPanda após o checkout. O payload é validado e o usuário é automaticamente persistido no MySQL. O acesso à plataforma é enviado quase em tempo real através de um *Magic Link* assinado e disparado via AWS SES, eliminando a fricção de criação de senhas.

### 2. Controle Condicional de Conteúdo (Time-based Release)
Implementação de uma lógica temporal no banco de dados relacional para liberação progressiva de módulos (ex: conteúdo destravado apenas 7 dias após a confirmação do pagamento do webhook), garantindo a integridade das regras de negócio.

### 3. Personalização Server-Side
O sistema injeta arquivos HTML/CSS estáticos, mantidos no sistema de arquivos do servidor, diretamente via Server-Side Rendering (SSR). Isso permite a personalização visual da interface de cada curso sem comprometer a performance do cliente ou exigir chamadas adicionais de API.

## 🚀 Infraestrutura e Deploy (Standalone Build)

Atualmente, o deploy é feito de forma bare-metal para maximizar o controle sobre o servidor e otimizar custos, contornando plataformas de PaaS gerenciadas. O processo demonstra conhecimento fundamental de Linux e arquitetura do Next.js:

1. **Build Otimizado:** Utilização do Next.js `output: 'standalone'` para gerar um bundle Node.js isolado, reduzindo drasticamente o tamanho dos artefatos.
2. **Transferência (SFTP):** Injeção manual dos assets estáticos (`/public` e `.next/static`) no diretório standalone, compactação e envio seguro via SFTP para um VPS Ubuntu (DigitalOcean).
3. **Orquestração e Proxy:** No servidor, a aplicação Node.js roda em background orquestrada pelo **PM2** para garantir alta disponibilidade. O **Nginx** atua como proxy reverso, recebendo as requisições nas portas 80/443 e lidando com o offloading de processos antes de repassar ao Node.js.

### Próximos Passos (Tech Debt)
* **CI/CD Pipeline:** Substituir o processo de build/transferência manual via SFTP por um fluxo automatizado utilizando GitHub Actions.
* **Infrastructure as Code (IaC):** Versionar os arquivos de configuração do Nginx, Docker Compose (MySQL) e ecossistema do PM2 dentro do repositório para facilitar a replicação do ambiente.
