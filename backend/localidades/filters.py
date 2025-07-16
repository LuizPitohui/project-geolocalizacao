# backend/localidades/filters.py
from rest_framework import filters

class BoundingBoxFilter(filters.BaseFilterBackend):
    """
    Filtra o queryset para incluir apenas localidades dentro de uma caixa delimitadora.
    """
    def filter_queryset(self, request, queryset, view):
        # Pega os parâmetros da URL, ex: /api/localidades/?in_bbox=-60,-3,-59,-4
        bbox_string = request.query_params.get('in_bbox')
        if not bbox_string:
            return queryset

        try:
            # Separa os 4 valores: oeste, sul, leste, norte
            west, south, east, north = [float(val) for val in bbox_string.split(',')]

            # Aplica o filtro no queryset do banco de dados
            return queryset.filter(
                longitude__gte=west,
                longitude__lte=east,
                latitude__gte=south,
                latitude__lte=north
            )
        except (ValueError, IndexError):
            # Se os parâmetros estiverem errados, não faz nada
            return queryset