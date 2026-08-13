from django.contrib.auth import get_user_model, authenticate
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from .serializers import RegisterSerializer, UserSerializer

User = get_user_model()


from rest_framework_simplejwt.tokens import RefreshToken

class RegisterView(generics.CreateAPIView):
  queryset = User.objects.all()
  permission_classes = [permissions.AllowAny]
  serializer_class = RegisterSerializer


class CurrentUserView(APIView):
  permission_classes = [permissions.IsAuthenticated]

  def get(self, request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data, status=status.HTTP_200_OK)


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

class StudentLoginView(APIView):
  permission_classes = [permissions.AllowAny]

  def post(self, request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)
    
    if user is not None:
      if getattr(user, 'role', '') != 'STUDENT':
        return Response({'error': 'Unauthorized. Student access only.'}, status=status.HTTP_403_FORBIDDEN)
      
      tokens = get_tokens_for_user(user)
      return Response({
          'token': tokens['access'],
          'refresh': tokens['refresh'],
          'user': {
              'id': user.id,
              'username': user.username,
              'email': user.email,
              'role': user.role
          }
      }, status=status.HTTP_200_OK)
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)

class AdminLoginView(APIView):
  permission_classes = [permissions.AllowAny]

  def post(self, request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)
    
    if user is not None:
      if getattr(user, 'role', '') != 'ADMIN' and not user.is_superuser:
        return Response({'error': 'Unauthorized. Admin access only.'}, status=status.HTTP_403_FORBIDDEN)
      
      tokens = get_tokens_for_user(user)
      return Response({
          'token': tokens['access'],
          'refresh': tokens['refresh'],
          'user': {
              'id': user.id,
              'username': user.username,
              'email': user.email,
              'role': getattr(user, 'role', 'ADMIN')
          }
      }, status=status.HTTP_200_OK)
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)