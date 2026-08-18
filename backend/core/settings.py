import os
from pathlib import Path
import environ
from django.core.exceptions import ImproperlyConfigured

# =========================================================
# BASE CONFIGURATION
# =========================================================

BASE_DIR = Path(__file__).resolve().parent.parent

# Initialize django-environ
env = environ.Env(
    DEBUG=(bool, False)
)

# Load .env for local development only.
# Vercel will use its Environment Variables.
environ.Env.read_env(os.path.join(BASE_DIR, '.env'))


# =========================================================
# SECURITY
# =========================================================

SECRET_KEY = env(
    'SECRET_KEY',
    default='django-insecure-development-key'
)

DEBUG = env.bool('DEBUG', default=False)

ALLOWED_HOSTS = [
    'quiz-vufu.vercel.app',
    '.vercel.app',
    'localhost',
    '127.0.0.1',
]


# =========================================================
# APPLICATIONS
# =========================================================

INSTALLED_APPS = [
    # Django
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-party
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',

    # Local apps
    'authentication',
    'quizzes',
]


# =========================================================
# MIDDLEWARE
# =========================================================

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',

    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]


# =========================================================
# URL / WSGI
# =========================================================

ROOT_URLCONF = 'core.urls'

WSGI_APPLICATION = 'core.wsgi.application'


# =========================================================
# TEMPLATES
# =========================================================

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]


# =========================================================
# DATABASE
# =========================================================

DATABASE_URL = env(
    'DATABASE_URL',
    default=None
)

if not DATABASE_URL:
    raise ImproperlyConfigured(
        'DATABASE_URL is not configured. '
        'Please add DATABASE_URL to the Vercel Environment Variables.'
    )

DATABASES = {
    'default': env.db('DATABASE_URL')
}


# =========================================================
# CUSTOM USER MODEL
# =========================================================

AUTH_USER_MODEL = 'authentication.User'


# =========================================================
# DJANGO REST FRAMEWORK
# =========================================================

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],

    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}


# =========================================================
# STATIC FILES
# =========================================================

STATIC_URL = '/static/'

STATIC_ROOT = BASE_DIR / 'staticfiles'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


# =========================================================
# CORS
# =========================================================

CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',

    # Production frontend
    'https://quiz-chi-ecru.vercel.app',
]


# =========================================================
# CSRF
# =========================================================

CSRF_TRUSTED_ORIGINS = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',

    # Production frontend
    'https://quiz-chi-ecru.vercel.app',
]


# =========================================================
# HTTPS / VERCEL
# =========================================================

SECURE_PROXY_SSL_HEADER = (
    'HTTP_X_FORWARDED_PROTO',
    'https'
)


# =========================================================
# PRODUCTION SECURITY
# =========================================================

if not DEBUG:
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True

    # Vercel already terminates HTTPS.
    # Therefore we don't force Django to redirect HTTPS.
    SECURE_SSL_REDIRECT = False