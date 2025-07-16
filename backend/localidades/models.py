# localidades/models.py

from django.db import models

class Localidade(models.Model):
    ibge = models.CharField("Código do Município (IBGE)", max_length=20, blank=True, null=True)
    uf = models.CharField("UF", max_length=5)
    municipio = models.CharField("Nome do Município", max_length=255)
    comunidade = models.CharField("Nome da Comunidade", max_length=255)
    tipo_comunidade = models.CharField("Tipo de Comunidade", max_length=100, blank=True, null=True)
    domicilios = models.IntegerField("Domicílios", blank=True, null=True)
    total_ligacoes = models.IntegerField("Total de Ligações", blank=True, null=True)
    latitude = models.FloatField(blank=True, null=True)
    longitude = models.FloatField(blank=True, null=True)

    class Meta:
        verbose_name = "Localidade"
        verbose_name_plural = "Localidades"
        # Garante que não teremos duas comunidades com mesmo nome no mesmo município
        unique_together = ('comunidade', 'municipio')

    def __str__(self):
        return f"{self.comunidade} - {self.municipio}"