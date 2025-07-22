# backend/localidades/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'localidades', views.LocalidadeViewSet, basename='localidade')
router.register(r'calhas', views.CalhaRioViewSet, basename='calha')

urlpatterns = [
    path('', include(router.urls)),
    # ADICIONE A NOVA ROTA CSRF
    path('csrf/', views.CSRFTokenView.as_view(), name='csrf'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('user/', views.UserStatusView.as_view(), name='user_status'),
]