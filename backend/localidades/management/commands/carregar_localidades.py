# backend/localidades/management/commands/carregar_localidades.py (VERSÃO FINAL E DEFINITIVA)

import pandas as pd
from django.core.management.base import BaseCommand, CommandError
from django.conf import settings
import json
import os
from localidades.models import Localidade, CalhaRio

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
    help = 'Lê as abas da planilha, associa calhas, remove duplicatas e gera um arquivo de fixture.'

    def add_arguments(self, parser):
        parser.add_argument('file_path', type=str, help='O caminho do arquivo Excel')

    def handle(self, *args, **options):
        file_path = options['file_path']
        output_path = os.path.join(settings.BASE_DIR, 'localidades', 'fixtures', 'localidades_fixture.json')

        self.stdout.write(self.style.SUCCESS(f'--- Iniciando processamento da planilha: {file_path} ---'))

        # --- LÓGICA DE ASSOCIAÇÃO DE CALHAS ---
        # 1. Busca todas as calhas do banco de dados para consulta rápida.
        calhas_map = {calha.nome: calha for calha in CalhaRio.objects.all()}
        if not calhas_map:
            raise CommandError('Nenhuma calha de rio encontrada no banco. Rode "python manage.py seed_calhas" primeiro.')

        # 2. Mapeamento de Município para Nome da Calha (baseado na lista oficial)
        municipio_para_calha = {
            'SANTA ISABEL DO RIO NEGRO': 'Calha do Alto Rio Negro', 'SÃO GABRIEL DA CACHOEIRA': 'Calha do Alto Rio Negro', 'BARCELOS': 'Calha do Alto Rio Negro',
            'MANAUS': 'Calha do Baixo Rio Negro', 'IRANDUBA': 'Calha do Baixo Rio Negro', 'NOVO AIRÃO': 'Calha do Baixo Rio Negro', 'CODAJÁS': 'Calha do Baixo Rio Negro',
            'ANORI': 'Calha do Baixo Rio Negro', 'ANAMÃ': 'Calha do Baixo Rio Negro', 'CAAPIRANGA': 'Calha do Baixo Rio Negro', 'MANACAPURU': 'Calha do Baixo Rio Negro',
            'MANAQUIRI': 'Calha do Baixo Rio Negro', 'CAREIRO': 'Calha do Baixo Rio Negro', 'CAREIRO DA VÁRZEA': 'Calha do Baixo Rio Negro',
            'ATALAIA DO NORTE': 'Calha do Alto Solimões', 'BENJAMIN CONSTANT': 'Calha do Alto Solimões', 'TABATINGA': 'Calha do Alto Solimões',
            'SÃO PAULO DE OLIVENÇA': 'Calha do Alto Solimões', 'AMATURÁ': 'Calha do Alto Solimões', 'SANTO ANTÔNIO DO IÇÁ': 'Calha do Alto Solimões', 'TONANTINS': 'Calha do Alto Solimões',
            'JAPURÁ': 'Calha do Médio Solimões', 'MARAÃ': 'Calha do Médio Solimões', 'FONTE BOA': 'Calha do Médio Solimões', 'JUTAÍ': 'Calha do Médio Solimões',
            'UARINI': 'Calha do Médio Solimões', 'ALVARÃES': 'Calha do Médio Solimões', 'JURUÁ': 'Calha do Médio Solimões', 'TEFÉ': 'Calha do Médio Solimões',
            'ITACOATIARA': 'Calha do Baixo Solimões', 'PRESIDENTE FIGUEIREDO': 'Calha do Baixo Solimões', 'RIO PRETO DA EVA': 'Calha do Baixo Solimões',
            'URUCURITUBA': 'Calha do Baixo Solimões', 'ITAPIRANGA': 'Calha do Baixo Solimões',
            'GUAJARÁ': 'Calha do Juruá', 'IPIXUNA': 'Calha do Juruá', 'ENVIRA': 'Calha do Juruá', 'ITAMARATI': 'Calha do Juruá', 'EIRUNEPÉ': 'Calha do Juruá', 'CARAUARI': 'Calha do Juruá',
            'PAUINI': 'Calha do Purus', 'LÁBREA': 'Calha do Purus', 'TAPAUÁ': 'Calha do Purus', 'BERURI': 'Calha do Purus', 'CANUTAMA': 'Calha do Purus', 'BOCA DO ACRE': 'Calha do Purus',
            'HUMAITÁ': 'Calha do Madeira', 'MANICORÉ': 'Calha do Madeira', 'NOVO ARIPUANÃ': 'Calha do Madeira', 'APUÍ': 'Calha do Madeira', 'BORBA': 'Calha do Madeira', 'NOVA OLINDA DO NORTE': 'Calha do Madeira',
            'BARREIRINHA': 'Calha do Baixo Amazonas', 'BOA VISTA DO RAMOS': 'Calha do Baixo Amazonas', 'NHAMUNDÁ': 'Calha do Baixo Amazonas',
            'URUCARÁ': 'Calha do Baixo Amazonas', 'SÃO SEBASTIÃO DO UATUMÃ': 'Calha do Baixo Amazonas', 'PARINTINS': 'Calha do Baixo Amazonas', 'MAUÉS': 'Calha do Baixo Amazonas',
            # Autazes aparece em duas listas, vamos associar a uma delas
            'AUTAZES': 'Calha do Baixo Solimões',
        }

        dados_tranche = self.processar_aba_tranche(file_path, calhas_map, municipio_para_calha)
        dados_convencional = self.processar_aba_convencional(file_path, calhas_map, municipio_para_calha)
        
        todos_os_dados = dados_tranche + dados_convencional
        self.stdout.write(self.style.SUCCESS(f'\nTotal de {len(todos_os_dados)} localidades válidas e únicas encontradas na planilha.'))

        django_fixture = self.converter_para_fixture(todos_os_dados)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(django_fixture, f, indent=4, ensure_ascii=False)

        self.stdout.write(self.style.SUCCESS(f'--- PROCESSO CONCLUÍDO ---'))
        self.stdout.write(self.style.SUCCESS(f'Arquivo de fixture gerado com sucesso em: {output_path}'))
        self.stdout.write(self.style.SUCCESS('Para carregar os dados no banco, rode agora: python manage.py loaddata localidades_fixture'))

    def processar_aba_convencional(self, file_path, calhas_map, municipio_para_calha):
        # ... (código da função sem alterações, apenas o que é passado para ela)
        sheet_name = 'Convencional'
        header_row_index = 3
        self.stdout.write(f"\n--- Lendo aba: '{sheet_name}' ---")
        try:
            df = pd.read_excel(file_path, sheet_name=sheet_name, header=header_row_index)
            df.columns = [str(col).strip() for col in df.columns]
            df = df.where(pd.notnull(df), None)
            
            dados_limpos = []
            chaves_unicas = set()

            for _, row in df.iterrows():
                comunidade = clean_value(row.get('Nome da Comunidade'), str)
                municipio = clean_value(row.get('Nome do Município'), str)
                lat = clean_value(row.get('Latitude'), float)
                lon = clean_value(row.get('Longitude'), float)

                if not all([comunidade, municipio, lat, lon]):
                    continue

                fonte_dados = Localidade.FonteDados.CONVENCIONAL
                chave_unica = (comunidade, municipio, fonte_dados)
                if chave_unica in chaves_unicas:
                    continue
                chaves_unicas.add(chave_unica)
                
                # --- LÓGICA DE ASSOCIAÇÃO DE CALHAS ---
                calha_nome = municipio_para_calha.get(municipio.upper())
                calha_obj_id = calhas_map[calha_nome].id if calha_nome and calha_nome in calhas_map else None

                item = {
                    'nome_comunidade': comunidade, 'municipio': municipio, 'latitude': lat, 'longitude': lon,
                    'ibge': clean_value(row.get('Código do Município (IBGE)'), str),
                    'uf': clean_value(row.get('UF'), str, default='AM'),
                    'tipo_comunidade': clean_value(row.get('Tipo de Comunidade'), str),
                    'domicilios': clean_value(row.get('Domicílios'), int),
                    'total_ligacoes': clean_value(row.get('Total de Ligações'), int),
                    'fonte_dados': fonte_dados,
                    'calha_rio': calha_obj_id, # Adiciona o ID da calha
                }
                dados_limpos.append(item)
            
            self.stdout.write(f"Encontradas {len(dados_limpos)} localidades VÁLIDAS e ÚNICAS na aba '{sheet_name}'.")
            return dados_limpos
        except Exception as e:
            raise CommandError(f"ERRO ao processar a aba '{sheet_name}': {e}")

    def processar_aba_tranche(self, file_path, calhas_map, municipio_para_calha):
        # ... (código da função sem alterações, apenas o que é passado para ela)
        sheet_name = '3ª Tranche'
        skip_rows = 7
        self.stdout.write(f"\n--- Lendo aba: '{sheet_name}' ---")
        try:
            df = pd.read_excel(file_path, sheet_name=sheet_name, header=None, skiprows=skip_rows)
            df = df.where(pd.notnull(df), None)

            dados_limpos = []
            chaves_unicas = set()

            for _, row in df.iterrows():
                comunidade = clean_value(row.iloc[3], str)
                municipio = clean_value(row.iloc[2], str)
                lat = clean_value(row.iloc[26], float)
                lon = clean_value(row.iloc[27], float)

                if not all([comunidade, municipio, lat, lon]):
                    continue

                fonte_dados = Localidade.FonteDados.TRANCHE
                chave_unica = (comunidade, municipio, fonte_dados)
                if chave_unica in chaves_unicas:
                    continue
                chaves_unicas.add(chave_unica)
                
                # --- LÓGICA DE ASSOCIAÇÃO DE CALHAS ---
                calha_nome = municipio_para_calha.get(municipio.upper())
                calha_obj_id = calhas_map[calha_nome].id if calha_nome and calha_nome in calhas_map else None

                item = {
                    'nome_comunidade': comunidade, 'municipio': municipio, 'latitude': lat, 'longitude': lon,
                    'ibge': clean_value(row.iloc[0], str),
                    'uf': clean_value(row.iloc[1], str, default='AM'),
                    'tipo_comunidade': clean_value(row.iloc[4], str),
                    'domicilios': clean_value(row.iloc[22], int),
                    'total_ligacoes': clean_value(row.iloc[29], int),
                    'fonte_dados': fonte_dados,
                    'calha_rio': calha_obj_id, # Adiciona o ID da calha
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