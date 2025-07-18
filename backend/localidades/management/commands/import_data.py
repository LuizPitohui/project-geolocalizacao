# backend/localidades/management/commands/import_data.py

import os
import pandas as pd
from django.core.management.base import BaseCommand
from django.conf import settings
from localidades.models import CalhaRio, Localidade
from django.db import IntegrityError

# Funções auxiliares para limpeza de dados
def clean_value(value, target_type, default=None):
    """
    Função genérica para limpar e converter dados de planilhas.
    - value: o valor da célula.
    - target_type: o tipo de dado desejado (int, float, str).
    - default: valor a ser retornado se a conversão falhar.
    """
    if value is None or pd.isna(value):
        return default
    
    try:
        if target_type == str:
            return str(value).strip()
        if target_type == int:
            return int(float(value))
        if target_type == float:
            # Substitui vírgula por ponto para o padrão decimal correto
            return float(str(value).replace(',', '.'))
    except (ValueError, TypeError):
        return default
    return value


class Command(BaseCommand):
    help = 'Importa dados de localidades e calhas de rios a partir de um arquivo Excel.'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('--- Iniciando o processo de importação ---'))

        # --- Etapa 1: Limpar dados antigos ---
        self.stdout.write('Limpando dados antigos das tabelas...')
        Localidade.objects.all().delete()
        CalhaRio.objects.all().delete()
        self.stdout.write(self.style.SUCCESS('Dados antigos removidos.'))

        # --- Etapa 2: Criar as Calhas de Rio ---
        calhas_nomes = [
            "Calha do Alto Rio Negro", "Calha do Juruá", "Calha do Purus",
            "Calha do Alto Solimões", "Calha do Madeira", 
            "Calha dos rios Negro e Solimões", "Calha do Baixo Amazonas",
            "Calha do Médio Amazonas", "Calha do Triângulo"
        ]
        for nome_calha in calhas_nomes:
            CalhaRio.objects.create(nome=nome_calha)
        self.stdout.write(self.style.SUCCESS(f'{len(calhas_nomes)} calhas de rios foram criadas.'))

        # --- Etapa 3: Mapear Municípios para Calhas ---
        calha_por_municipio = {
            'TAPAUA': 'Calha do Purus', 'LABREA': 'Calha do Purus', 'SANTA ISABEL DO RIO NEGRO': 'Calha do Alto Rio Negro',
            'SAO GABRIEL DA CACHOEIRA': 'Calha do Alto Rio Negro', 'BARCELOS': 'Calha do Alto Rio Negro', 'GUAJARA': 'Calha do Juruá',
            'IPIXUNA': 'Calha do Juruá', 'ENVIRA': 'Calha do Juruá', 'ITAMARATI': 'Calha do Juruá', 'EIRUNEPE': 'Calha do Juruá',
            'CARAUARI': 'Calha do Juruá', 'PAUINI': 'Calha do Purus', 'BERURI': 'Calha do Purus', 'CANUTAMA': 'Calha do Purus',
            'BOCA DO ACRE': 'Calha do Purus', 'ATALAIA DO NORTE': 'Calha do Alto Solimões', 'BENJAMIN CONSTANT': 'Calha do Alto Solimões',
            'TABATINGA': 'Calha do Alto Solimões', 'SAO PAULO DE OLIVENCA': 'Calha do Alto Solimões', 'AMATURA': 'Calha do Alto Solimões',
            'SANTO ANTONIO DO ICA': 'Calha do Alto Solimões', 'TONANTINS': 'Calha do Alto Solimões', 'HUMAITA': 'Calha do Madeira',
            'MANICORE': 'Calha do Madeira', 'NOVO ARIPUANA': 'Calha do Madeira', 'APUI': 'Calha do Madeira', 'BORBA': 'Calha do Madeira',
            'NOVA OLINDA DO NORTE': 'Calha do Madeira', 'MANAUS': 'Calha dos rios Negro e Solimões', 'IRANDUBA': 'Calha dos rios Negro e Solimões',
            'NOVO AIRAO': 'Calha dos rios Negro e Solimões', 'CODAJAS': 'Calha dos rios Negro e Solimões', 'ANORI': 'Calha dos rios Negro e Solimões',
            'ANAMA': 'Calha dos rios Negro e Solimões', 'CAAPIRANGA': 'Calha dos rios Negro e Solimões', 'MANACAPURU': 'Calha dos rios Negro e Solimões',
            'MANAQUIRI': 'Calha dos rios Negro e Solimões', 'CAREIRO': 'Calha dos rios Negro e Solimões',
            'CAREIRO DA VARZEA': 'Calha dos rios Negro e Solimões', 'BARREIRINHA': 'Calha do Baixo Amazonas',
            'BOA VISTA DO RAMOS': 'Calha do Baixo Amazonas', 'NHAMUNDA': 'Calha do Baixo Amazonas', 'URUCARA': 'Calha do Baixo Amazonas',
            'SAO SEBASTIAO DO UATUMA': 'Calha do Baixo Amazonas', 'PARINTINS': 'Calha do Baixo Amazonas', 'MAUES': 'Calha do Baixo Amazonas',
            'ITACOATIARA': 'Calha do Médio Amazonas', 'PRESIDENTE FIGUEIREDO': 'Calha do Médio Amazonas', 'RIO PRETO DA EVA': 'Calha do Médio Amazonas',
            'AUTAZES': 'Calha do Médio Amazonas', 'URUCURITUBA': 'Calha do Médio Amazonas', 'ITAPIRANGA': 'Calha do Médio Amazonas',
            'JAPURA': 'Calha do Triângulo', 'MARAA': 'Calha do Triângulo', 'FONTE BOA': 'Calha do Triângulo',
            'JUTAI': 'Calha do Triângulo', 'UARINI': 'Calha do Triângulo', 'ALVARAES': 'Calha do Triângulo',
            'JURUA': 'Calha do Triângulo', 'TEFE': 'Calha do Triângulo'
        }
        calhas = {calha.nome: calha for calha in CalhaRio.objects.all()}
        
        excel_file_path = os.path.join(settings.BASE_DIR, 'data', '3ª Tranche Remotos e Convencional v2.xlsx')
        
        if not os.path.exists(excel_file_path):
            self.stdout.write(self.style.ERROR(f'Arquivo não encontrado: {excel_file_path}'))
            return

        # --- Leitura da Aba "3ª Tranche" por POSIÇÃO de coluna ---
        self.stdout.write("Processando a aba '3ª Tranche'...")
        try:
            df_tranche = pd.read_excel(excel_file_path, sheet_name='3ª Tranche', header=None, skiprows=7)
            
            success_count = 0
            fail_count = 0

            for index, row in df_tranche.iterrows():
                try:
                    # Usando índices numéricos para as colunas: 0=A, 1=B, 2=C, etc.
                    municipio_str = clean_value(row.iloc[2], str)
                    comunidade_str = clean_value(row.iloc[3], str)

                    if not municipio_str or not comunidade_str:
                        fail_count += 1
                        continue

                    lat = clean_value(row.iloc[26], float)
                    lng = clean_value(row.iloc[27], float)
                    
                    if lat is None or lng is None:
                        self.stdout.write(self.style.WARNING(f"[Tranche] Linha {index + 8}: Coordenadas ausentes para '{comunidade_str}'. Pulando."))
                        fail_count += 1
                        continue
                    
                    municipio_normalizado = municipio_str.upper().replace('Á', 'A').replace('Ã', 'A').replace('É', 'E').replace('Ô', 'O')
                    calha_nome = calha_por_municipio.get(municipio_normalizado)
                    calha_obj = calhas.get(calha_nome) if calha_nome else None

                    Localidade.objects.create(
                        fonte_dados=Localidade.FonteDados.TRANCHE,
                        ibge=clean_value(row.iloc[0], str),
                        uf=clean_value(row.iloc[1], str, default='AM'),
                        municipio=municipio_str,
                        nome_comunidade=comunidade_str,
                        tipo_comunidade=clean_value(row.iloc[4], str),
                        latitude=lat,
                        longitude=lng,
                        domicilios=clean_value(row.iloc[5], int),
                        total_ligacoes=clean_value(row.iloc[22], int),
                        calha_rio=calha_obj,
                    )
                    success_count += 1
                except (IntegrityError, IndexError) as e:
                    self.stdout.write(self.style.WARNING(f"[Tranche] Linha {index + 8}: Falha ao processar '{comunidade_str}'. Erro: {e}. Pulando."))
                    fail_count += 1
            
            self.stdout.write(self.style.SUCCESS(f"Aba '3ª Tranche': {success_count} importadas, {fail_count} puladas."))
        
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Não foi possível processar a aba '3ª Tranche': {e}"))


        # --- Leitura da Aba "Convencional" por NOME de coluna ---
        self.stdout.write("Processando a aba 'Convencional'...")
        try:
            df_convencional = pd.read_excel(excel_file_path, sheet_name='Convencional', header=3)
            df_convencional.columns = [str(col).strip() for col in df_convencional.columns]
            
            success_count = 0
            fail_count = 0

            for index, row in df_convencional.iterrows():
                try:
                    municipio_str = clean_value(row.get('Nome do Município'), str)
                    comunidade_str = clean_value(row.get('Nome da Comunidade'), str)

                    if not municipio_str or not comunidade_str:
                        fail_count += 1
                        continue

                    lat = clean_value(row.get('Latitude'), float)
                    lng = clean_value(row.get('Longitude'), float)

                    if lat is None or lng is None:
                        self.stdout.write(self.style.WARNING(f"[Convencional] Linha {index + 5}: Coordenadas ausentes para '{comunidade_str}'. Pulando."))
                        fail_count += 1
                        continue
                    
                    municipio_normalizado = municipio_str.upper().replace('Á', 'A').replace('Ã', 'A').replace('É', 'E').replace('Ô', 'O')
                    calha_nome = calha_por_municipio.get(municipio_normalizado)
                    calha_obj = calhas.get(calha_nome) if calha_nome else None
                    
                    Localidade.objects.create(
                        fonte_dados=Localidade.FonteDados.CONVENCIONAL,
                        ibge=clean_value(row.get('Código do Municipio (IBGE)'), str),
                        uf=clean_value(row.get('UF'), str, default='AM'), # Explicitamente define 'AM' se o campo for vazio
                        municipio=municipio_str,
                        nome_comunidade=comunidade_str,
                        tipo_comunidade=clean_value(row.get('Tipo de Comunidade'), str),
                        latitude=lat,
                        longitude=lng,
                        domicilios=clean_value(row.get('Domicílios'), int),
                        total_ligacoes=clean_value(row.get('Total de Ligações'), int),
                        calha_rio=calha_obj,
                    )
                    success_count += 1
                except IntegrityError:
                    self.stdout.write(self.style.WARNING(f"[Convencional] Linha {index + 5}: Localidade '{comunidade_str}' em '{municipio_str}' já existe. Pulando."))
                    fail_count += 1
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"[Convencional] Erro inesperado na linha {index + 5} ('{comunidade_str}'): {e}"))
                    fail_count += 1
            
            self.stdout.write(self.style.SUCCESS(f"Aba 'Convencional': {success_count} importadas, {fail_count} puladas."))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Não foi possível processar a aba 'Convencional': {e}"))

        total_final = Localidade.objects.count()
        self.stdout.write(self.style.SUCCESS(f'--- Processo de importação concluído! Total de {total_final} localidades no banco de dados. ---'))