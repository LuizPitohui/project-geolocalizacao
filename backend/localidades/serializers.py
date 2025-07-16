# localidades/serializers.py

from rest_framework import serializers
from .models import Localidade

class LocalidadeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Localidade
        # '__all__' significa que queremos incluir todos os campos
        # do nosso modelo Localidade na tradução.
        fields = '__all__'