from django.contrib.auth import get_user_model
from django.db.models import Avg, Count
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Quiz, Attempt, Question, Option
from .serializers import (
    QuizSerializer,
    QuizDetailSerializer,
    AttemptSerializer,
    AttemptSubmissionSerializer,
    QuestionSerializer,
    OptionSerializer
)

User = get_user_model()


class QuizViewSet(viewsets.ModelViewSet):
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUserRole()]
        return [permissions.AllowAny()]

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return QuizDetailSerializer
        return QuizSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and getattr(user, 'role', None) == 'ADMIN':
            return Quiz.objects.all()
        return Quiz.objects.filter(status='PUBLISHED')

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def submit(self, request, pk=None):
        quiz = self.get_object()
        answers_data = request.data.get('answers', {})

        # Map from frontend dictionary style to serializer nested list style
        formatted_answers = []
        for q_id, opt_id in answers_data.items():
            formatted_answers.append({
                'question': int(q_id),
                'selected_option': int(opt_id) if opt_id is not None else None
            })

        submission_data = {
            'quiz': quiz.id,
            'answers': formatted_answers
        }

        serializer = AttemptSubmissionSerializer(
            data=submission_data,
            context={'request': request}
        )
        if serializer.is_valid():
            attempt = serializer.save()
            return Response({'attempt_id': attempt.id}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AttemptViewSet(viewsets.ModelViewSet):
    serializer_class = AttemptSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and getattr(user, 'role', None) == 'ADMIN':
            return Attempt.objects.all()
        return Attempt.objects.filter(user=user)


class LeaderboardView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        users_data = (
            User.objects.filter(attempt__status__in=['PASSED', 'FAILED', 'COMPLETED'])
            .annotate(
                average_score=Avg('attempt__percentage'),
                quizzes_completed=Count('attempt')
            )
            .order_by('-average_score', '-quizzes_completed')
        )

        data = []
        for u in users_data:
            data.append({
                'student_name': u.username,
                'average_score': round(u.average_score, 1) if u.average_score is not None else 0,
                'quizzes_completed': u.quizzes_completed
            })
        return Response(data)


class IsAdminUserRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and getattr(request.user, 'role', None) == 'ADMIN'


class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    permission_classes = [IsAdminUserRole]


class OptionViewSet(viewsets.ModelViewSet):
    queryset = Option.objects.all()
    serializer_class = OptionSerializer
    permission_classes = [IsAdminUserRole]


class AdminAnalyticsView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        total_students = User.objects.filter(role='STUDENT').count()
        total_quizzes = Quiz.objects.count()
        published_quizzes = Quiz.objects.filter(status='PUBLISHED').count()
        total_attempts = Attempt.objects.count()
        
        avg_score_data = Attempt.objects.aggregate(Avg('percentage'))
        average_score = round(avg_score_data['percentage__avg'], 1) if avg_score_data['percentage__avg'] is not None else 0
        
        return Response({
            'total_students': total_students,
            'total_quizzes': total_quizzes,
            'published_quizzes': published_quizzes,
            'total_attempts': total_attempts,
            'average_score': average_score
        })