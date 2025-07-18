# localidades/serializers.py

from rest_framework import serializers
from .models import Localidade

class LocalidadeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Localidade
        fields = '__all__'

class LocalidadeNomeSerializer(serializers.ModelSerializer):
    """
    Serializer leve que retorna os dados essenciais para os menus de seleção
    E TAMBÉM as coordenadas para a função de foco no mapa.
    """
    class Meta:
        model = Localidade
        # ALTERADO: Adicionamos latitude e longitude aos campos
        fields = ['id', 'comunidade', 'municipio', 'uf', 'latitude', 'longitude']