# localidades/management/commands/carregar_localidades.py

import pandas as pd
from django.core.management.base import BaseCommand
from localidades.models import Localidade
import numpy as np

class Command(BaseCommand):
    help = 'Carrega dados de localidades lendo as colunas por posição, ignorando o cabeçalho.'

    def add_arguments(self, parser):
        parser.add_argument('caminho_do_arquivo', type=str, help='O caminho para o arquivo .xlsx')
        parser.add_argument(
            '--skiprows',
            type=int,
            default=2,
            help='Quantas linhas pular no início do arquivo antes de começar a ler os dados. (Ex: 2 para pular as duas primeiras linhas)'
        )

    def handle(self, *args, **options):
        caminho = options['caminho_do_arquivo']
        skip = options['skiprows']

        self.stdout.write(self.style.SUCCESS(f'--- INICIANDO CARREGAMENTO POR POSIÇÃO ---'))
        self.stdout.write(f'Arquivo: {caminho}, pulando as primeiras {skip} linhas.')

        try:
            # Ignora o cabeçalho e lê os dados diretamente
            df = pd.read_excel(caminho, header=None, skiprows=skip)
            df = df.where(pd.notnull(df), None)

            criadas, atualizadas = 0, 0

            for index, row in df.iterrows():
                try:
                    # Mapeando os dados pela POSIÇÃO (índice) da coluna
                    # Coluna A -> 0, Coluna B -> 1, Coluna C -> 2, etc.
                    
                    comunidade_nome = row[3]  # Coluna D
                    municipio_nome = row[2]  # Coluna C

                    if not comunidade_nome or not municipio_nome:
                        self.stdout.write(self.style.WARNING(f'Linha {index + skip + 1} ignorada: comunidade ou município vazio.'))
                        continue
                    
                    # Converte para número, tratando erros
                    def to_int(value):
                        if value is None: return None
                        try:
                            return int(float(str(value).replace(',', '.')))
                        except (ValueError, TypeError):
                            return None

                    defaults_data = {
                        'ibge': row[0],             # Coluna A
                        'uf': row[1],               # Coluna B
                        'tipo_comunidade': row[4], # Coluna E
                        'domicilios': to_int(row[5]),# Coluna F
                        'total_ligacoes': to_int(row.get(13)), # Coluna N (ex: 38.1)
                        'latitude': row.get(14),    # Coluna O
                        'longitude': row.get(15)    # Coluna P
                    }

                    obj, created = Localidade.objects.update_or_create(
                        comunidade=str(comunidade_nome),
                        municipio=str(municipio_nome),
                        defaults=defaults_data
                    )
                    
                    if created:
                        criadas += 1
                    else:
                        atualizadas += 1
                
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f'Erro ao processar linha {index + skip + 1}: {e}'))

            self.stdout.write(self.style.SUCCESS('--- PROCESSO CONCLUÍDO ---'))
            self.stdout.write(self.style.SUCCESS(f'{criadas} novas localidades criadas.'))
            self.stdout.write(self.style.SUCCESS(f'{atualizadas} localidades existentes foram atualizadas.'))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'ERRO GERAL: {e}'))