from django.contrib import admin
from .models import Localidade
# Register your models here.

@admin.register(Localidade)
class LocalidadeAdmin(admin.ModelAdmin):
    list_display = ('comunidade', 'municipio', 'uf', 'tipo_comunidade', 'domicilios')
    search_fields = ('comunidade', 'municipio', 'uf')
    list_filter = ('uf', 'municipio', 'tipo_comunidade')