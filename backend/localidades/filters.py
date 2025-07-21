# backend/localidades/filters.py (VERSÃO FINAL E CORRIGIDA)

from rest_framework import filters
from django_filters import rest_framework as django_filters
from .models import Localidade

class LocalidadeFilter(django_filters.FilterSet):
    # Mantemos o filtro customizado para fonte_dados para ignorar maiúsculas/minúsculas
    fonte_dados = django_filters.CharFilter(field_name='fonte_dados', lookup_expr='iexact')
    
    # REMOVEMOS a linha 'calha_rio = ...' que estava causando o problema.
    # Agora, o django-filter vai criar o filtro para 'calha_rio' automaticamente
    # a partir da lista 'fields' abaixo, da maneira correta.

    class Meta:
        model = Localidade
        # A lista de campos pelos quais queremos permitir a filtragem.
        fields = ['fonte_dados', 'calha_rio']

# O BoundingBoxFilter que usamos no mapa não precisa de alterações.
class BoundingBoxFilter(filters.BaseFilterBackend):
    def filter_queryset(self, request, queryset, view):
        bbox_string = request.query_params.get('in_bbox')
        if not bbox_string:
            return queryset
        try:
            west, south, east, north = [float(val) for val in bbox_string.split(',')]
            return queryset.filter(
                longitude__gte=west,
                longitude__lte=east,
                latitude__gte=south,
                latitude__lte=north
            )
        except (ValueError, IndexError):
            return queryset