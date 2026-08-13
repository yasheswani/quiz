from django.urls import path
from .views import CurrentUserView, RegisterView, StudentLoginView, AdminLoginView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth-register'),
    path('login/student/', StudentLoginView.as_view(), name='auth-login-student'),
    path('login/admin/', AdminLoginView.as_view(), name='auth-login-admin'),
    path('me/', CurrentUserView.as_view(), name='auth-current-user'),
]