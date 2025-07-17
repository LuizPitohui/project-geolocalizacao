# localidades/views.py

from django.shortcuts import render
from rest_framework import viewsets, filters
from .models import Localidade
# ALTERADO: Importamos o novo serializer
from .serializers import LocalidadeSerializer, LocalidadeNomeSerializer
from geopy.distance import geodesic
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .filters import BoundingBoxFilter


class LocalidadeViewSet(viewsets.ReadOnlyModelViewSet):
    # Esta ViewSet continua como está, perfeita para o mapa
    queryset = Localidade.objects.all().order_by('municipio', 'comunidade')
    serializer_class = LocalidadeSerializer
    filter_backends = [BoundingBoxFilter, filters.SearchFilter]
    search_fields = ['comunidade', 'municipio', 'uf']


# NOVO: ViewSet para os nomes das localidades
class LocalidadeNomeViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet leve que retorna uma lista simplificada de todas as localidades.
    Usada para popular os menus de seleção sem sobrecarregar a aplicação.
    A paginação é desativada para garantir que todos os nomes venham de uma vez.
    """
    queryset = Localidade.objects.all().order_by('comunidade')
    serializer_class = LocalidadeNomeSerializer
    pagination_class = None # IMPORTANTE: Desativa a paginação


# A view de distância continua a mesma
@api_view(['POST'])
def calcular_distancia_view(request):
    ponto_a_id = request.data.get('ponto_a_id')
    ponto_b_id = request.data.get('ponto_b_id')

    if not ponto_a_id or not ponto_b_id:
        return Response(
            {"error": "É necessário fornecer os IDs de ambos os pontos."},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        ponto_a = Localidade.objects.get(pk=ponto_a_id)
        ponto_b = Localidade.objects.get(pk=ponto_b_id)

        coords_a = (ponto_a.latitude, ponto_a.longitude)
        coords_b = (ponto_b.latitude, ponto_b.longitude)
        
        if not all(coords_a) or not all(coords_b):
                return Response(
                    {"error": "Uma ou ambas as localidades não possuem coordenadas válidas."},
                    status=status.HTTP_400_BAD_REQUEST
                )

        distancia_km = geodesic(coords_a, coords_b).km

        return Response({"distancia_km": round(distancia_km, 2)})

    except Localidade.DoesNotExist:
        return Response(
            {"error": "Uma ou ambas as localidades não foram encontradas."},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)