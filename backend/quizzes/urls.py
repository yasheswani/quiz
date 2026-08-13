from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import (
    AttemptViewSet,
    QuizViewSet,
    LeaderboardView,
    QuestionViewSet,
    OptionViewSet,
    AdminAnalyticsView
)

router = DefaultRouter()
router.register(r'quizzes', QuizViewSet, basename='quiz')
router.register(r'attempts', AttemptViewSet, basename='attempt')
router.register(r'questions', QuestionViewSet, basename='question')
router.register(r'options', OptionViewSet, basename='option')

urlpatterns = [
    path('leaderboard/', LeaderboardView.as_view(), name='leaderboard'),
    path('admin/analytics/', AdminAnalyticsView.as_view(), name='admin-analytics'),
    path('', include(router.urls)),
]