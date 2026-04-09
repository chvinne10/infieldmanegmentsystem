# =========================
# STATIC FILES (🔥 IMPORTANT FIX)
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

# ❌ MUST NOT EXIST
# CORS_ALLOW_ALL_ORIGINS = True


# =========================
# CSRF
# =========================

CSRF_TRUSTED_ORIGINS = [
    "https://infieldmanegmentsystem.vercel.app",
    "https://*.vercel.app",
]
