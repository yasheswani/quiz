from rest_framework import serializers
from .models import Answer, Attempt, Option, Question, Quiz


class OptionSerializer(serializers.ModelSerializer):
    option_text = serializers.CharField(source='text', required=False)

    class Meta:
        model = Option
        fields = ['id', 'question', 'text', 'option_text', 'is_correct']

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        request = self.context.get('request')
        if not (request and request.user and request.user.is_authenticated and getattr(request.user, 'role', None) == 'ADMIN'):
            rep.pop('is_correct', None)
        return rep


class QuestionSerializer(serializers.ModelSerializer):
    options = OptionSerializer(many=True, read_only=True)
    question_text = serializers.CharField(source='text', required=False)

    class Meta:
        model = Question
        fields = ['id', 'quiz', 'text', 'question_text', 'options']


class QuizSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(required=False, default='General')
    category = serializers.CharField(source='category_name', read_only=True)
    duration = serializers.IntegerField(required=False, default=10)
    difficulty = serializers.CharField(required=False, default='Beginner')
    questions = QuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Quiz
        fields = [
            'id',
            'title',
            'description',
            'category',
            'category_name',
            'duration',
            'passing_score',
            'difficulty',
            'status',
            'created_at',
            'questions',
        ]


class QuizDetailSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(required=False, default='General')
    category = serializers.CharField(source='category_name', read_only=True)
    duration = serializers.IntegerField(required=False, default=10)
    difficulty = serializers.CharField(required=False, default='Beginner')
    questions = QuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Quiz
        fields = [
            'id',
            'title',
            'description',
            'category',
            'category_name',
            'duration',
            'passing_score',
            'difficulty',
            'status',
            'questions',
        ]


class AnswerSerializer(serializers.ModelSerializer):
    question_text = serializers.CharField(source='question.text', read_only=True)
    selected_option_text = serializers.CharField(source='selected_option.text', read_only=True)
    correct_option_text = serializers.SerializerMethodField()

    class Meta:
        model = Answer
        fields = ('id', 'attempt', 'question', 'question_text', 'selected_option', 'selected_option_text', 'is_correct', 'correct_option_text')

    def get_correct_option_text(self, obj):
        correct_option = obj.question.options.filter(is_correct=True).first()
        return correct_option.text if correct_option else ""


class AnswerSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = ['question', 'selected_option']


class AttemptSerializer(serializers.ModelSerializer):
    quiz_title = serializers.CharField(source='quiz.title', read_only=True)
    answers = AnswerSerializer(many=True, read_only=True)

    class Meta:
        model = Attempt
        fields = (
            'id',
            'quiz',
            'quiz_title',
            'user',
            'score',
            'percentage',
            'correct_answers',
            'incorrect_answers',
            'unanswered',
            'status',
            'created_at',
            'completed_at',
            'answers',
        )
        read_only_fields = (
            'user',
            'score',
            'percentage',
            'status',
            'completed_at',
        )


class AttemptSubmissionSerializer(serializers.ModelSerializer):
    answers = AnswerSubmissionSerializer(many=True)

    class Meta:
        model = Attempt
        fields = ['id', 'quiz', 'answers', 'score', 'percentage', 'status']
        read_only_fields = ['score', 'percentage', 'status']

    def create(self, validated_data):
        answers_data = validated_data.pop('answers')
        quiz = validated_data['quiz']
        user = self.context['request'].user

        attempt = Attempt.objects.create(quiz=quiz, user=user, status='IN_PROGRESS')

        correct_count = 0
        total_questions = quiz.questions.count()

        for ans_data in answers_data:
            question = ans_data['question']
            selected_option = ans_data.get('selected_option')

            is_correct = False
            if selected_option:
                # Check if the chosen option is correct
                is_correct = (
                    selected_option.is_correct
                    and selected_option.question == question
                )
                if is_correct:
                    correct_count += 1

            Answer.objects.create(
                attempt=attempt,
                question=question,
                selected_option=selected_option,
                is_correct=is_correct,
            )

        # Calculate final scores
        score = correct_count * 10  # Example: 10 points per correct answer
        percentage = (
            (correct_count / total_questions) * 100 if total_questions > 0 else 0
        )

        # Calculate unanswered questions
        answered_question_ids = {ans['question'].id for ans in answers_data if ans.get('selected_option') is not None}
        unanswered_count = total_questions - len(answered_question_ids)

        attempt.score = score
        attempt.percentage = percentage
        attempt.correct_answers = correct_count
        attempt.incorrect_answers = total_questions - correct_count - unanswered_count
        attempt.unanswered = unanswered_count
        attempt.status = 'PASSED' if percentage >= quiz.passing_score else 'FAILED'
        attempt.save()

        return attempt