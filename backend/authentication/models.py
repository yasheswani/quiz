from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
  ROLE_CHOICES = (
      ('ADMIN', 'Admin'),
      ('STUDENT', 'Student'),
  )
  role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='STUDENT')

  # Add unique related_name values to avoid clashes with default auth.User
  groups = models.ManyToManyField(
      'auth.Group',
      verbose_name='groups',
      blank=True,
      help_text=(
          'The groups this user belongs to. A user will get all permissions'
          ' granted to each of their groups.'
      ),
      related_name='authentication_user_set',
      related_query_name='authentication_user',
  )
  user_permissions = models.ManyToManyField(
      'auth.Permission',
      verbose_name='user permissions',
      blank=True,
      help_text='Specific permissions for this user.',
      related_name='authentication_user_set',
      related_query_name='authentication_user',
  )

  def __str__(self):
    return self.username