# backend/localidades/views.py

from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Localidade, CalhaRio
from .serializers import LocalidadeSerializer, CalhaRioSerializer

class LocalidadeViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para listar e recuperar Localidades.
    Este endpoint é somente para leitura (não permite criar ou apagar via API).
    """
    # Define a consulta base, pegando todas as localidades que têm coordenadas.
    queryset = Localidade.objects.exclude(latitude__isnull=True).exclude(longitude__isnull=True).order_by('municipio', 'nome_comunidade')
    
    # Usa o serializador que definimos para formatar a saída.
    serializer_class = LocalidadeSerializer
    
    # Define os mecanismos de filtro que a API irá suportar.
    filter_backends = [
        DjangoFilterBackend, # Filtro por campos exatos
        filters.SearchFilter, # Filtro de busca textual
    ]
    
    # Campos que podem ser usados para filtrar, ex: /api/localidades/?fonte_dados=Convencional
    filterset_fields = ['fonte_dados', 'municipio', 'calha_rio']
    
    # Campos onde a busca textual (ex: /api/localidades/?search=tapaua) será aplicada.
    # Corrigimos 'comunidade' para 'nome_comunidade'.
    search_fields = ['nome_comunidade', 'municipio']

class CalhaRioViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para listar todas as Calhas de Rio.
    Útil para popular o dropdown de filtros no frontend.
    """
    queryset = CalhaRio.objects.all().order_by('nome')
    serializer_class = CalhaRioSerializer