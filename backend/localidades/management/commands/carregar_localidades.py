# backend/localidades/management/commands/carregar_localidades.py (VERSÃO FINAL E DEFINITIVA)

import pandas as pd
from django.core.management.base import BaseCommand, CommandError
from django.conf import settings
import json
import os
from localidades.models import Localidade

def clean_value(value, target_type, default=None):
    if value is None or pd.isna(value):
        return default
    try:
        if target_type == str:
            return str(value).strip()
        if target_type == int:
            return int(float(str(value).replace(',', '.')))
        if target_type == float:
            return float(str(value).replace(',', '.'))
    except (ValueError, TypeError):
        return default
    return value

class Command(BaseCommand):
    help = 'Lê as abas da planilha, remove duplicatas e gera um arquivo de fixture para o Django.'

    def add_arguments(self, parser):
        parser.add_argument('file_path', type=str, help='O caminho do arquivo Excel')

    def handle(self, *args, **options):
        file_path = options['file_path']
        output_path = os.path.join(settings.BASE_DIR, 'localidades', 'fixtures', 'localidades_fixture.json')

        self.stdout.write(self.style.SUCCESS(f'--- Iniciando processamento da planilha: {file_path} ---'))

        dados_tranche = self.processar_aba('3ª Tranche', file_path, header_row_index=7, is_tranche=True)
        dados_convencional = self.processar_aba('Convencional', file_path, header_row_index=3, is_tranche=False)
        
        todos_os_dados = dados_tranche + dados_convencional
        self.stdout.write(self.style.SUCCESS(f'\nTotal de {len(todos_os_dados)} localidades válidas encontradas na planilha.'))

        django_fixture = self.converter_para_fixture(todos_os_dados)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(django_fixture, f, indent=4, ensure_ascii=False)

        self.stdout.write(self.style.SUCCESS(f'--- PROCESSO CONCLUÍDO ---'))
        self.stdout.write(self.style.SUCCESS(f'Arquivo de fixture gerado com sucesso em: {output_path}'))
        self.stdout.write(self.style.SUCCESS('Para carregar os dados no banco, rode agora: python manage.py loaddata localidades_fixture'))

    def processar_aba(self, sheet_name, file_path, header_row_index, is_tranche):
        self.stdout.write(f"\n--- Lendo aba: '{sheet_name}' ---")
        try:
            df = pd.read_excel(file_path, sheet_name=sheet_name, header=header_row_index)
            df.columns = [str(col).strip() for col in df.columns]
            df = df.where(pd.notnull(df), None)
            
            dados_limpos = []
            chaves_unicas = set() # Usaremos um set para controlar as duplicatas

            for _, row in df.iterrows():
                if is_tranche:
                    comunidade = clean_value(row.get('Nome da Comunidade'), str)
                    municipio = clean_value(row.get('Nome do Município'), str)
                    lat = clean_value(row.get('Latitude'), float)
                    lon = clean_value(row.get('Longitude'), float)
                else:
                    comunidade = clean_value(row.get('Nome da Comunidade'), str)
                    municipio = clean_value(row.get('Nome do Município'), str)
                    lat = clean_value(row.get('Latitude'), float)
                    lon = clean_value(row.get('Longitude'), float)

                if not all([comunidade, municipio, lat, lon]):
                    continue

                # --- LÓGICA DE DEDUPLICAÇÃO ---
                fonte_dados = Localidade.FonteDados.TRANCHE if is_tranche else Localidade.FonteDados.CONVENCIONAL
                chave_unica = (comunidade, municipio, fonte_dados)
                if chave_unica in chaves_unicas:
                    continue # Pula esta linha se já vimos essa combinação
                chaves_unicas.add(chave_unica)
                
                item = {
                    'nome_comunidade': comunidade, 'municipio': municipio, 'latitude': lat, 'longitude': lon,
                    'ibge': clean_value(row.get('Código do Municipio (IBGE)') or row.get('Código do Município (IBGE)'), str),
                    'uf': clean_value(row.get('UF'), str, default='AM'),
                    'tipo_comunidade': clean_value(row.get('Tipo de Comunidade'), str),
                    'domicilios': clean_value(row.get('Quantidade de Unidades Consumidoras') or row.get('Domicílios'), int),
                    'total_ligacoes': clean_value(row.get('Total de Ligações') or row.get('Total de unidades consumidoras previstas'), int),
                    'fonte_dados': fonte_dados,
                }
                dados_limpos.append(item)
            
            self.stdout.write(f"Encontradas {len(dados_limpos)} localidades VÁLIDAS e ÚNICAS na aba '{sheet_name}'.")
            return dados_limpos
        except Exception as e:
            raise CommandError(f"ERRO ao processar a aba '{sheet_name}': {e}")

    def converter_para_fixture(self, dados):
        django_fixture = []
        for pk_atual, item in enumerate(dados, start=1):
            fixture_item = {
                'model': 'localidades.localidade',
                'pk': pk_atual,
                'fields': item
            }
            django_fixture.append(fixture_item)
        return django_fixture