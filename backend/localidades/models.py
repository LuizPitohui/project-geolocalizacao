# backend/localidades/models.py

from django.db import models

# Modelo para armazenar as 9 Calhas de Rios do Amazonas.
# Este modelo será populado uma única vez com os nomes das calhas.
class CalhaRio(models.Model):
    """Representa uma calha de rio do estado do Amazonas."""
    # O nome da calha, ex: "Calha do Juruá"
    nome = models.CharField(max_length=100, unique=True, db_index=True)

    def __str__(self):
        return self.nome

    class Meta:
        verbose_name = "Calha de Rio"
        verbose_name_plural = "Calhas de Rios"
        ordering = ['nome'] # Opcional: ordena as calhas por nome


# Modelo principal para armazenar os dados das localidades
# vindos de ambas as planilhas.
class Localidade(models.Model):
    """Representa uma localidade, que pode ser da 3ª Tranche ou Convencional."""

    # Define as duas possíveis fontes de dados para facilitar o filtro.
    class FonteDados(models.TextChoices):
        TRANCHE = '3ª Tranche'
        CONVENCIONAL = 'Convencional'

    # --- CAMPOS PRINCIPAIS ---
    
    # Código IBGE do município. `db_index=True` melhora a performance de buscas.
    ibge = models.CharField("Código IBGE", max_length=10, db_index=True, null=True, blank=True)
    
    # Sigla da Unidade Federativa (ex: AM)
    # ===== ALTERAÇÃO AQUI: Adicionado 'default="AM"' para evitar erros com células vazias =====
    uf = models.CharField("UF", max_length=2, default='AM')
    
    # Nome do município.
    municipio = models.CharField("Município", max_length=100, db_index=True)
    
    # Nome da comunidade/localidade.
    nome_comunidade = models.CharField("Nome da Comunidade", max_length=255, db_index=True)
    
    # Tipo de comunidade (ex: ribeirinhos, terra indígena).
    tipo_comunidade = models.CharField("Tipo de Comunidade", max_length=100, null=True, blank=True)

    # Número de domicílios. Este campo virá principalmente da planilha "Convencional".
    # Para a planilha "3ª Tranche", usaremos o valor de "Quantidade de Unidades Consumidoras".
    domicilios = models.IntegerField("Domicílios/UCs", null=True, blank=True)
    
    # Total de ligações/UCs previstas.
    total_ligacoes = models.IntegerField("Total de Ligações", null=True, blank=True)
    
    # Coordenadas geográficas.
    latitude = models.FloatField("Latitude")
    longitude = models.FloatField("Longitude")
    
    # --- CAMPOS DE RELACIONAMENTO E CONTROLE ---

    # Chave estrangeira que conecta esta localidade a uma calha de rio.
    calha_rio = models.ForeignKey(
        CalhaRio, 
        verbose_name="Calha de Rio",
        on_delete=models.SET_NULL, # Se uma calha for deletada, o campo fica nulo.
        null=True, 
        blank=True,
        related_name='localidades'
    )
    
    # Campo para identificar a planilha de origem ("3ª Tranche" ou "Convencional").
    # Essencial para a lógica de filtragem no frontend.
    fonte_dados = models.CharField(
        "Fonte dos Dados",
        max_length=20,
        choices=FonteDados.choices
    )

    def __str__(self):
        """Representação em texto do objeto, útil no admin do Django."""
        return f"{self.nome_comunidade} ({self.municipio}) - {self.fonte_dados}"

    class Meta:
        verbose_name = "Localidade"
        verbose_name_plural = "Localidades"
        # Garante que não teremos localidades duplicadas da mesma fonte.
        unique_together = ('nome_comunidade', 'municipio', 'fonte_dados')