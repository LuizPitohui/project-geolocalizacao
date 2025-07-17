# localidades/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'localidades', views.LocalidadeViewSet, basename='localidade')
router.register(r'localidades-nomes', views.LocalidadeNomeViewSet, basename='localidade-nome')

urlpatterns = [
    path('', include(router.urls)),
    path('distancia/', views.calcular_distancia_view, name='calcular-distancia'),
]