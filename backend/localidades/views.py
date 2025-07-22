# backend/localidades/views.py (VERSÃO FINAL E CORRIGIDA)

from django.contrib.auth import authenticate, login, logout
from django.middleware.csrf import get_token
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .filters import LocalidadeFilter, BoundingBoxFilter
from .models import Localidade, CalhaRio
from .serializers import LocalidadeSerializer, CalhaRioSerializer

# --- Views de API para os Dados ---
class LocalidadeViewSet(viewsets.ReadOnlyModelViewSet):
    # ... (seu código aqui não muda)
    queryset = Localidade.objects.select_related('calha_rio').all()
    serializer_class = LocalidadeSerializer
    filter_backends = [DjangoFilterBackend, BoundingBoxFilter, filters.SearchFilter]
    filterset_class = LocalidadeFilter
    search_fields = ['nome_comunidade', 'municipio', 'uf']
    pagination_class = None

class CalhaRioViewSet(viewsets.ReadOnlyModelViewSet):
    # ... (seu código aqui não muda)
    queryset = CalhaRio.objects.all().order_by('nome')
    serializer_class = CalhaRioSerializer

# --- Views de API para Autenticação por Sessão ---

class CSRFTokenView(APIView):
    """View para fornecer o token CSRF ao frontend."""
    permission_classes = [permissions.AllowAny]
    def get(self, request, format=None):
        return Response({'csrfToken': get_token(request)})

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request, format=None):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        if user is not None:
            login(request, user)
            return Response({'detail': 'Login bem-sucedido!', 'username': user.username})
        return Response({'detail': 'Credenciais inválidas.'}, status=status.HTTP_401_UNAUTHORIZED)

class LogoutView(APIView):
    def post(self, request, format=None):
        logout(request)
        return Response({'detail': 'Logout bem-sucedido.'}, status=status.HTTP_200_OK)

class UserStatusView(APIView):
    # ALTERADO: Permite que qualquer um acesse, mas a lógica interna verifica a autenticação
    permission_classes = [permissions.AllowAny]
    def get(self, request, format=None):
        if request.user.is_authenticated:
            return Response({'username': request.user.username, 'isAuthenticated': True})
        # Retorna uma resposta de sucesso, mas indicando que não há usuário
        return Response({'isAuthenticated': False})