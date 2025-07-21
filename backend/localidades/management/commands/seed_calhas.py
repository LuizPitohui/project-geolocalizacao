# backend/localidades/management/commands/seed_calhas.py

from django.core.management.base import BaseCommand
from localidades.models import CalhaRio
from django.db import transaction

class Command(BaseCommand):
    help = 'Limpa a tabela CalhaRio e a preenche com as 9 calhas oficiais do Amazonas.'

    # A lista oficial das 9 calhas
    CALHAS_OFICIAIS = [
        "Calha do Alto Rio Negro",
        "Calha do Baixo Rio Negro",
        "Calha do Alto Solimões",
        "Calha do Médio Solimões",
        "Calha do Baixo Solimões",
        "Calha do Juruá",
        "Calha do Purus",
        "Calha do Madeira",
        "Calha do Baixo Amazonas",
    ]

    @transaction.atomic # Garante que a operação seja "tudo ou nada"
    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING('--- Iniciando a padronização das Calhas de Rios ---'))

        # 1. Apaga todas as calhas existentes
        deletados, _ = CalhaRio.objects.all().delete()
        self.stdout.write(self.style.SUCCESS(f'{deletados} calhas antigas foram apagadas.'))

        # 2. Cria as calhas oficiais a partir da lista
        novas_calhas = []
        for nome_calha in self.CALHAS_OFICIAIS:
            calha, created = CalhaRio.objects.get_or_create(nome=nome_calha)
            if created:
                novas_calhas.append(calha)
        
        self.stdout.write(self.style.SUCCESS(f'{len(novas_calhas)} novas calhas oficiais foram criadas.'))
        self.stdout.write(self.style.SUCCESS('--- Padronização concluída com sucesso! ---'))