# backend/localidades/admin.py

from django.contrib import admin
from .models import Localidade, CalhaRio

# Registra o modelo CalhaRio no painel de administração.
@admin.register(CalhaRio)
class CalhaRioAdmin(admin.ModelAdmin):
    list_display = ('nome',)
    search_fields = ('nome',)

# Registra o modelo Localidade no painel de administração.
@admin.register(Localidade)
class LocalidadeAdmin(admin.ModelAdmin):
    """
    Configura a exibição e os filtros para o modelo Localidade
    no painel de administração do Django.
    """
    # Campos que serão exibidos na lista de localidades.
    # Corrigido de 'comunidade' para 'nome_comunidade'.
    list_display = ('nome_comunidade', 'municipio', 'uf', 'calha_rio', 'fonte_dados')
    
    # Adiciona filtros na barra lateral para facilitar a navegação.
    list_filter = ('fonte_dados', 'calha_rio', 'uf', 'municipio')
    
    # Adiciona uma barra de busca para pesquisar por estes campos.
    search_fields = ('nome_comunidade', 'municipio')
    
    # Melhora a performance para campos com muitos valores únicos.
    raw_id_fields = ('calha_rio',)