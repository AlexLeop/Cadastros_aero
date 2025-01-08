# Visão Geral da API

## Introdução

Esta API fornece endpoints para gerenciamento de arquivos e registros, com suporte a:

- Upload e processamento de arquivos
- Validação de registros
- Exportação de dados
- Notificações em tempo real
- Configurações dinâmicas

## Autenticação

A API usa autenticação JWT (JSON Web Token). Para autenticar:

1. Faça uma requisição POST para `/api/token/` com suas credenciais
2. Use o token retornado no header `Authorization: Bearer <token>`

## Paginação

Endpoints que retornam listas são paginados por padrão:

```json
{
    "count": 100,
    "next": "http://api.exemplo.com/records/?page=2",
    "previous": null,
    "results": []
}
```

## Erros

A API usa códigos HTTP padrão e retorna erros no formato:

```json
{
    "error": "Mensagem de erro",
    "details": {}
}
```

## Rate Limiting

- Usuários anônimos: 100 requisições/hora
- Usuários autenticados: 1000 requisições/hora

## Webhooks

A API suporta webhooks para notificações de eventos:

1. Registre um webhook em `/api/webhooks/`
2. Configure os eventos que deseja receber
3. Receba notificações em tempo real

## Exemplos

### Upload de arquivo

```python
import requests

files = {'file': open('data.csv', 'rb')}
headers = {'Authorization': f'Bearer {token}'}

response = requests.post(
    'http://api.exemplo.com/files/',
    files=files,
    headers=headers
)
```

### Listar registros

```python
response = requests.get(
    'http://api.exemplo.com/records/',
    headers={'Authorization': f'Bearer {token}'},
    params={'status': 'validated'}
)
``` 