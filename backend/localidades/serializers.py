# backend/localidades/serializers.py

from rest_framework import serializers
from .models import Localidade, CalhaRio

class CalhaRioSerializer(serializers.ModelSerializer):
    """
    Serializador para o modelo CalhaRio.
    Converte os objetos CalhaRio para o formato JSON.
    """
    class Meta:
        model = CalhaRio
        # Inclui todos os campos do modelo no JSON de saída.
        fields = '__all__'

class LocalidadeSerializer(serializers.ModelSerializer):
    """
    Serializador para o modelo Localidade.
    Converte os objetos Localidade para o formato JSON.
    """
    # Para mostrar o nome da calha em vez de apenas o seu ID.
    # `source` aponta para o objeto relacionado e `read_only=True`
    # significa que este campo é apenas para leitura.
    calha_rio = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Localidade
        # Define quais campos do modelo serão incluídos na representação JSON.
        fields = [
            'id',
            'ibge',
            'uf',
            'municipio',
            'nome_comunidade',
            'tipo_comunidade',
            'domicilios',
            'total_ligacoes',
            'latitude',
            'longitude',
            'calha_rio',
            'fonte_dados',
        ]