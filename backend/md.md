## Ativar virtualização
* source .venv/bin/activate
* deactivate

## Camando para executar a API
* uvicorn app.main:app --reload

## Ruff
* python -m pip install ruff

# Verificar problemas
ruff check .

# Corrigir automaticamente os problemas que permitem correcção
ruff check . --fix

# Formatar o código
ruff format .

ruff format .

## Depois actualiza as dependências:
* python -m pip freeze > requirements.txt
