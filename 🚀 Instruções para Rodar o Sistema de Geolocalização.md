# 🚀 Instruções para Rodar o Sistema de Geolocalização

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado em sua máquina:

- **Python 3.8+** (recomendado Python 3.11)
- **Node.js 18+** 
- **npm** ou **yarn**
- **Git** (opcional)

## 📂 1. Extrair o Projeto

1. Descompacte o arquivo `project-geolocalizacao.zip`
2. Navegue até a pasta extraída:
   ```bash
   cd project-geolocalizacao
   ```

## 🐍 2. Configurar o Backend (Django)

### 2.1. Navegar para a pasta do backend
```bash
cd backend
```

### 2.2. Criar ambiente virtual (recomendado)
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### 2.3. Instalar dependências
```bash
pip install -r requirements_clean.txt
```

### 2.4. Executar migrações (se necessário)
```bash
python manage.py migrate
```

### 2.5. Iniciar o servidor Django
```bash
python manage.py runserver 0.0.0.0:8000
```

O backend estará rodando em: `http://localhost:8000`

## ⚛️ 3. Configurar o Frontend (React)

### 3.1. Abrir um novo terminal e navegar para a pasta do frontend
```bash
cd frontend
```

### 3.2. Instalar dependências
```bash
npm install
```

### 3.3. Iniciar o servidor React
```bash
npm start
```

O frontend estará rodando em: `http://localhost:3000`

## 🔐 4. Acessar o Sistema

1. Abra seu navegador e acesse: `http://localhost:3000`
2. Faça login com as credenciais:
   - **Usuário**: `admin`
   - **Senha**: `admin123`

## 🗂️ 5. Estrutura do Projeto

```
project-geolocalizacao/
├── backend/                 # API Django
│   ├── config/             # Configurações do Django
│   ├── localidades/        # App principal com modelos e views
│   ├── db.sqlite3          # Banco de dados (já populado)
│   ├── localidades.json    # Dados das 1089 localidades
│   └── requirements_clean.txt
├── frontend/               # Aplicação React
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── pages/          # Páginas (Login, Dashboard)
│   │   ├── context/        # Contexto de autenticação
│   │   └── services/       # Configuração da API
│   └── package.json
```

## ✨ 6. Funcionalidades Disponíveis

### 🔑 Login
- Tela de login profissional com logo Norte Tech
- Autenticação JWT segura

### 🏠 Dashboard
- Mapa interativo (Leaflet)
- Filtros por fonte de dados (3ª Tranche / Convencional)
- Filtros por calha de rio (13 opções disponíveis)
- Cálculo de distância entre pontos
- Visualização de 1089 localidades do Amazonas

### 🗺️ Mapa
- Inicia vazio (conforme solicitado)
- Exibe localidades após aplicar filtros
- Popups informativos com dados completos
- Cálculo de rotas entre pontos

## 🔧 7. Solução de Problemas

### Erro de CORS
Se encontrar erros de CORS, verifique se:
- O backend está rodando na porta 8000
- O frontend está rodando na porta 3000
- As configurações em `backend/config/settings.py` incluem a porta correta

### Erro de dependências
Se houver problemas com dependências:
```bash
# Backend
pip install --upgrade pip
pip install -r requirements_clean.txt

# Frontend
npm install --legacy-peer-deps
```

### Banco de dados
O banco já vem populado com 1089 localidades. Se precisar recriar:
```bash
cd backend
python populate_db.py
```

## 📞 8. Suporte

Se encontrar algum problema:
1. Verifique se todos os pré-requisitos estão instalados
2. Confirme se ambos os servidores estão rodando
3. Verifique os logs no terminal para mensagens de erro
4. Entre em contato para suporte adicional

## 🎯 9. Dados do Sistema

- **Total de localidades**: 1089
- **Planilhas**: 3ª Tranche e Convencional  
- **Calhas de rios**: 13 opções
- **Campos por localidade**: ID, IBGE, UF, Município, Nome da Comunidade, Tipo, Domicílios, Total de Ligações, Latitude, Longitude

---

**Sistema desenvolvido com Django + React + Material-UI + Leaflet**

