from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()




class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    class Meta:
        model = User
        fields = ["id", "email", "username", "password"]

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        # user = User.objects.create_user(
        #     validated_data['username'],
        #     validated_data['email'],
        #     validated_data['password']
        # )
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'first_name', 'last_name']
        read_only_fields = ["id", "email"]
    