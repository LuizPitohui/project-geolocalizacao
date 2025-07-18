# backend/localidades/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# O router gera automaticamente as URLs para os ViewSets.
router = DefaultRouter()
router.register(r'localidades', views.LocalidadeViewSet, basename='localidade')
router.register(r'calhas', views.CalhaRioViewSet, basename='calha')

# As URLs da nossa API serão prefixadas com 'api/'.
urlpatterns = [
    path('', include(router.urls)),
]