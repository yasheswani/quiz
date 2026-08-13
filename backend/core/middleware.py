from django.contrib.auth import get_user_model
from django.utils.deprecation import MiddlewareMixin

class AutoLoginMiddleware(MiddlewareMixin):
    def process_request(self, request):
        if request.path.startswith('/api/auth/') or request.path.startswith('/admin/'):
            return
        if not hasattr(request, 'user') or request.user.is_anonymous:
            # Fallback to the first user in the database if request is not authenticated
            User = get_user_model()
            user = User.objects.first()
            if user:
                request.user = user
