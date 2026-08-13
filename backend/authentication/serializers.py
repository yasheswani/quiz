from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
  class Meta:
    model = User
    fields = ('id', 'username', 'email', 'role')


class RegisterSerializer(serializers.ModelSerializer):
  password = serializers.CharField(write_only=True)

  class Meta:
    model = User
    fields = ('username', 'email', 'password')

  def create(self, validated_data):
    user = User.objects.create_user(
        username=validated_data['username'],
        email=validated_data.get('email', ''),
        password=validated_data['password'],
        role='STUDENT',
    )
    return user