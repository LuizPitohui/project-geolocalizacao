# localidades/serializers.py

from rest_framework import serializers
from .models import Localidade

# ALTERADO: O serializer original continua como está
class LocalidadeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Localidade
        fields = '__all__'

# NOVO: Criamos um serializer super leve apenas para nomes
class LocalidadeNomeSerializer(serializers.ModelSerializer):
    """
    Serializer leve que retorna apenas o ID e os nomes
    para popular os campos de Autocomplete no front-end.
    """
    class Meta:
        model = Localidade
        fields = ['id', 'comunidade', 'municipio', 'uf']