"""
Django settings for Smart Field Work Manager project.
"""

import os
from pathlib import Path
from datetime import timedelta
from decouple import config
import dj_database_url

# 1. DEFINE BASE_DIR FIRST! (This fixes your error)
BASE_DIR = Path(__file__).resolve().parent.parent

# 2. SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = config('SECRET_KEY', default='django-insecure-change-me-in-production')

# 3. SECURITY WARNING: don't run with debug turned on in production!
DEBUG = config('DEBUG', default=False, cast=bool)

# ALLOWED HOSTS
_allowed = config('ALLOWED_HOSTS', default='localhost,127.0.0.1').split(',')
if os.getenv('RENDER_EXTERNAL_HOSTNAME'):
    _allowed.append(os.getenv('RENDER_EXTERNAL_HOSTNAME'))
ALLOWED_HOSTS = [h.strip() for h in _allowed if h.strip()]

# =========================
# STATIC FILES (Now BASE_DIR exists, so this works!)
# =========================
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# ⚠️ REMOVE THIS LINE IF EXISTS (causes collectstatic error)
# STATICFILES_DIRS = [os.path.join(BASE_DIR, 'static')]

# =========================
# CORS CONFIG (FINAL)
# =========================
CORS_ALLOWED_ORIGINS = [
    "https://infieldmanegmentsystem.vercel.app",
]

CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^https://.*\.vercel\.app$",
]

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

# =========================
# CSRF
# =========================
CSRF_TRUSTED_ORIGINS = [
    "https://infieldmanegmentsystem.vercel.app",
    "https://*.vercel.app",
]

# ... Keep the rest of your file (INSTALLED_APPS, MIDDLEWARE, DATABASES, etc.) below this ...