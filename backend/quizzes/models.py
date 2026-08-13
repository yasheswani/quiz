from django.conf import settings
from django.db import models


class Quiz(models.Model):
  STATUS_CHOICES = (
      ('DRAFT', 'Draft'),
      ('PUBLISHED', 'Published'),
  )
  title = models.CharField(max_length=255)
  description = models.TextField(blank=True)
  category_name = models.CharField(max_length=100, default='General', blank=True)
  duration = models.IntegerField(default=10)  # Duration in minutes
  passing_score = models.IntegerField(default=50)
  difficulty = models.CharField(max_length=50, default='Beginner')
  status = models.CharField(
      max_length=10, choices=STATUS_CHOICES, default='DRAFT'
  )
  created_at = models.DateTimeField(auto_now_add=True)

  def __str__(self):
    return self.title


class Question(models.Model):
  quiz = models.ForeignKey(
      Quiz, related_name='questions', on_delete=models.CASCADE
  )
  text = models.TextField()

  def __str__(self):
    return self.text


class Option(models.Model):
  question = models.ForeignKey(
      Question, related_name='options', on_delete=models.CASCADE
  )
  text = models.CharField(max_length=255)
  is_correct = models.BooleanField(default=False)

  def __str__(self):
    return f'{self.text} ({"Correct" if self.is_correct else "Incorrect"})'


class Attempt(models.Model):
  quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE)
  user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
  score = models.IntegerField(default=0)
  percentage = models.FloatField(default=0.0)
  correct_answers = models.IntegerField(default=0)
  incorrect_answers = models.IntegerField(default=0)
  unanswered = models.IntegerField(default=0)
  status = models.CharField(max_length=20, default='IN_PROGRESS')
  created_at = models.DateTimeField(auto_now_add=True)
  completed_at = models.DateTimeField(blank=True, null=True)

  def __str__(self):
    return (
        f'Attempt by {self.user} on {self.quiz.title} - Status:'
        f' {self.status}'
    )


class Answer(models.Model):
  attempt = models.ForeignKey(
      Attempt, related_name='answers', on_delete=models.CASCADE
  )
  question = models.ForeignKey(Question, on_delete=models.CASCADE)
  selected_option = models.ForeignKey(
      Option, on_delete=models.SET_NULL, null=True, blank=True
  )
  is_correct = models.BooleanField(default=False)

  def __str__(self):
    return f'Answer for {self.question.text[:30]}'