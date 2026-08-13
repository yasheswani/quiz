from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

# Register with UserAdmin so password hashing and interface controls work correctly
admin.site.register(User, UserAdmin)