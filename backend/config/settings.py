import os
from datetime import timedelta
from pathlib import Path

import dj_database_url
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")


def env_bool(name: str, default: bool = False) -> bool:
    return os.getenv(name, str(default)).strip().lower() in {"1", "true", "yes", "on"}


def env_list(name: str, default: str = "") -> list[str]:
    return [item.strip() for item in os.getenv(name, default).split(",") if item.strip()]


SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "unsafe-development-key-change-me")
DEBUG = env_bool("DJANGO_DEBUG", False)
DEPLOYED_BACKEND_HOST = "streamcheck-drui.onrender.com"
DEPLOYED_FRONTEND_ORIGINS = (
    "https://streamcheck-six.vercel.app",
    "https://streamcheck-if4jid4jo-jitens-projects-9272a67e.vercel.app",
)
ALLOWED_HOSTS = list(
    dict.fromkeys(
        [*env_list("DJANGO_ALLOWED_HOSTS", "localhost,127.0.0.1"), DEPLOYED_BACKEND_HOST]
    )
)

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "corsheaders",
    "django_filters",
    "rest_framework",
    "drf_spectacular",
    "rest_framework_simplejwt.token_blacklist",
    "apps.accounts",
    "apps.catalog",
    "apps.watchlist",
    "apps.subscriptions",
    "apps.activity",
    "apps.reports",
    "apps.core",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    }
]

WSGI_APPLICATION = "config.wsgi.application"
ASGI_APPLICATION = "config.asgi.application"

DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR / 'db.sqlite3'}")
database_config = dj_database_url.parse(
    DATABASE_URL,
    conn_max_age=int(os.getenv("DATABASE_CONN_MAX_AGE", "600")),
    conn_health_checks=True,
)

# Supabase is PostgreSQL. Its transaction pooler (port 6543) does not support
# prepared statements or server-side cursors, while direct/session connections do.
database_host = str(database_config.get("HOST", "")).lower()
is_supabase = database_host.endswith((".supabase.co", ".supabase.com"))
is_transaction_pooler = env_bool(
    "DATABASE_TRANSACTION_POOLER",
    str(database_config.get("PORT", "")) == "6543",
)

if database_config["ENGINE"] == "django.db.backends.postgresql":
    database_options = database_config.setdefault("OPTIONS", {})
    if env_bool("DATABASE_SSL_REQUIRE", is_supabase):
        database_options.setdefault("sslmode", os.getenv("DATABASE_SSLMODE", "require"))
    if is_transaction_pooler:
        database_config["CONN_MAX_AGE"] = int(os.getenv("DATABASE_CONN_MAX_AGE", "0"))
        database_config["DISABLE_SERVER_SIDE_CURSORS"] = True
        database_options.setdefault("prepare_threshold", None)

DATABASES = {"default": database_config}

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_DIRS = [BASE_DIR / "static"]
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": ("rest_framework.permissions.IsAuthenticated",),
    "DEFAULT_FILTER_BACKENDS": (
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ),
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "PAGE_SIZE": 20,
    "DEFAULT_RENDERER_CLASSES": (
        "rest_framework.renderers.JSONRenderer",
        *(("rest_framework.renderers.BrowsableAPIRenderer",) if DEBUG else ()),
    ),
}

SPECTACULAR_SETTINGS = {
    "TITLE": "StreamCheck API",
    "DESCRIPTION": "REST API for the StreamCheck media streaming platform.",
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
    "COMPONENT_SPLIT_REQUEST": True,
    "ENUM_NAME_OVERRIDES": {
        "PaymentStatusEnum": "apps.subscriptions.models.Payment.Status",
        "SubscriptionStatusEnum": "apps.subscriptions.models.Subscription.Status",
    },
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(
        minutes=int(os.getenv("ACCESS_TOKEN_LIFETIME_MINUTES", "15"))
    ),
    "REFRESH_TOKEN_LIFETIME": timedelta(
        days=int(os.getenv("REFRESH_TOKEN_LIFETIME_DAYS", "7"))
    ),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "UPDATE_LAST_LOGIN": True,
    "AUTH_HEADER_TYPES": ("Bearer",),
}

CORS_ALLOWED_ORIGINS = list(
    dict.fromkeys(
        [
            *env_list(
                "CORS_ALLOWED_ORIGINS",
                "http://localhost:5173,http://127.0.0.1:5173",
            ),
            *DEPLOYED_FRONTEND_ORIGINS,
        ]
    )
)
CORS_ALLOWED_ORIGIN_REGEXES = env_list(
    "CORS_ALLOWED_ORIGIN_REGEXES",
    r"^https://streamcheck-[a-z0-9-]+-jitens-projects-9272a67e\.vercel\.app$",
)
CORS_ALLOWED_ORIGIN_REGEXES = list(
    dict.fromkeys(
        [
            *CORS_ALLOWED_ORIGIN_REGEXES,
            r"^http://(localhost|127\.0\.0\.1):517[3-9]$",
        ]
    )
)
CSRF_TRUSTED_ORIGINS = list(
    dict.fromkeys(
        [
            *env_list(
                "CSRF_TRUSTED_ORIGINS",
                "http://localhost:5173,http://127.0.0.1:5173",
            ),
            *DEPLOYED_FRONTEND_ORIGINS,
        ]
    )
)
CORS_ALLOW_CREDENTIALS = True

SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SESSION_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_SECURE = not DEBUG
