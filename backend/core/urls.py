from django.contrib import admin
from django.http import HttpResponse
from django.urls import include, path


def home_view(request):
    return HttpResponse(
        '<h1>Quiz Platform Backend is Running Successfully!</h1><p>Access your'
        ' API endpoints at <a href="/api/quizzes/">/api/quizzes/</a></p>'
    )


urlpatterns = [
    path('', home_view, name='home'),
    path('admin/', admin.site.urls),
    path('api/auth/', include('authentication.urls')),
    path('api/', include('quizzes.urls')),  # Must match 'api/'
]