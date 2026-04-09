# =========================
# ✅ FINAL CORS FIX (CLEAN)
# =========================

# ✅ Allow your frontend (VERY IMPORTANT)
CORS_ALLOWED_ORIGINS = [
    "https://infieldmanegmentsystem.vercel.app",
]

# ✅ Allow all Vercel preview deployments
CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^https://.*\.vercel\.app$",
]

# ✅ Allow credentials (JWT)
CORS_ALLOW_CREDENTIALS = True

# ✅ Allow headers
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

# ✅ Allow methods
CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

# ❌ REMOVE THIS (IMPORTANT)
# CORS_ALLOW_ALL_ORIGINS = True


# =========================
# ✅ CSRF FIX (IMPORTANT)
# =========================

CSRF_TRUSTED_ORIGINS = [
    "https://infieldmanegmentsystem.vercel.app",
]
