# backend/localidades/management/commands/converter_fixture.py

import json
from django.core.management.base import BaseCommand, CommandError
from django.conf import settings
import os

class Command(BaseCommand):
    help = 'Converte um arquivo JSON simples em um fixture JSON formatado para o Django.'

    def handle(self, *args, **options):
        # Define os caminhos dos arquivos de entrada e saída
        input_file_path = os.path.join(settings.BASE_DIR, 'localidades', 'fixtures', 'localidades.json')
        output_file_path = os.path.join(settings.BASE_DIR, 'localidades', 'fixtures', 'localidades_fixture.json')

        self.stdout.write(self.style.SUCCESS(f'Lendo o arquivo de entrada: {input_file_path}'))

        try:
            with open(input_file_path, 'r', encoding='utf-8') as f:
                plain_data = json.load(f)
        except FileNotFoundError:
            raise CommandError(f'Arquivo não encontrado! Certifique-se de que "localidades.json" está em "localidades/fixtures/"')
        except json.JSONDecodeError:
            raise CommandError('O arquivo "localidades.json" não é um JSON válido.')

        django_fixture = []
        for item in plain_data:
            # Pega o ID para usar como a chave primária (pk)
            pk = item.pop('id', None)
            if pk is None:
                self.stdout.write(self.style.WARNING(f'Item ignorado por não ter um "id": {item}'))
                continue

            # Cria a estrutura de fixture do Django
            fixture_item = {
                'model': 'localidades.localidade', # Formato: nome_do_app.nome_do_modelo
                'pk': pk,
                'fields': item # O resto dos dados vai para o campo "fields"
            }
            django_fixture.append(fixture_item)

        # Salva o novo arquivo de fixture formatado
        with open(output_file_path, 'w', encoding='utf-8') as f:
            json.dump(django_fixture, f, indent=4, ensure_ascii=False)

        self.stdout.write(self.style.SUCCESS(f'Conversão concluída!'))
        self.stdout.write(self.style.SUCCESS(f'Novo arquivo de fixture salvo em: {output_file_path}'))
        self.stdout.write(self.style.SUCCESS('Agora você pode rodar: python manage.py loaddata localidades_fixture'))