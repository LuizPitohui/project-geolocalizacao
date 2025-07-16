# localidades/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# O Router gera as URLs para a ViewSet automaticamente
router = DefaultRouter()
router.register(r'localidades', views.LocalidadeViewSet, basename='localidade')

urlpatterns = [
    path('', include(router.urls)),
    path('distancia/', views.calcular_distancia_view, name='calcular-distancia'),
]