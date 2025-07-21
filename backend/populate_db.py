
import os
import sys
import django
import json

# Configurar o Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from localidades.models import Localidade, CalhaRio

def load_localidades():
    # Carregar o arquivo JSON
    with open('localidades.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Limpar dados existentes
    Localidade.objects.all().delete()
    
    # Criar localidades
    localidades_criadas = 0
    for item in data:
        try:
            localidade = Localidade.objects.create(
                ibge=item.get('IBGE', ''),
                uf=item.get('UF', 'AM'),
                municipio=item.get('Municipio', ''),
                nome_comunidade=item.get('nome_comunidade', ''),
                tipo_comunidade=item.get('tipo_comunidade', ''),
                domicilios=item.get('Domicilios', 0) or 0,
                total_ligacoes=item.get('Total_Ligacoes', 0) or 0,
                latitude=float(item.get('Latitude', 0)) if item.get('Latitude') else 0,
                longitude=float(item.get('Longitude', 0)) if item.get('Longitude') else 0,
                fonte_dados=item.get('fonte_dados', '')
            )
            localidades_criadas += 1
        except Exception as e:
            print(f'Erro ao criar localidade {item.get("nome_comunidade", "N/A")}: {e}')
    
    print(f'Total de localidades criadas: {localidades_criadas}')

def create_calhas():
    # Criar calhas de rios baseadas no arquivo que você forneceu
    calhas_data = [
        'Alto Solimões',
        'Médio Solimões', 
        'Baixo Solimões',
        'Alto Amazonas',
        'Médio Amazonas',
        'Baixo Amazonas',
        'Rio Negro',
        'Rio Madeira',
        'Rio Tapajós',
        'Rio Xingu',
        'Rio Tocantins',
        'Rio Purus',
        'Rio Juruá',
    ]
    
    # Limpar dados existentes
    CalhaRio.objects.all().delete()
    
    for nome_calha in calhas_data:
        CalhaRio.objects.create(nome=nome_calha)
    
    print(f'Total de calhas criadas: {len(calhas_data)}')

if __name__ == '__main__':
    print('Criando calhas de rios...')
    create_calhas()
    print('Carregando localidades...')
    load_localidades()
    print('Processo concluído!')

