# ── Stage 1: Node build ──────────────────────────────────────────────────────
FROM node:22-alpine AS node-builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --frozen-lockfile

COPY resources/ resources/
COPY public/      public/
COPY vite.config.* tsconfig* ./

RUN npm run build

# ── Stage 2: Composer dependencies ───────────────────────────────────────────
FROM composer:2.8 AS composer-builder

WORKDIR /app

COPY composer.json composer.lock ./
RUN composer install \
    --no-dev \
    --no-interaction \
    --no-scripts \
    --optimize-autoloader \
    --prefer-dist

COPY . .
RUN composer dump-autoload --optimize --no-dev

# ── Stage 3: Production image ─────────────────────────────────────────────────
FROM php:8.3-fpm-alpine AS production

LABEL maintainer="AIKFS"

# Runtime dependencies
RUN apk add --no-cache \
    nginx \
    supervisor \
    curl \
    libpng \
    libjpeg-turbo \
    libwebp \
    freetype \
    icu \
    oniguruma \
    libzip \
    gettext \
    ffmpeg \
    && apk add --no-cache --virtual .build-deps \
        autoconf \
        g++ \
        make \
        libpng-dev \
        libjpeg-turbo-dev \
        libwebp-dev \
        freetype-dev \
        icu-dev \
        oniguruma-dev \
        libzip-dev \
        linux-headers \
    && docker-php-ext-configure gd \
        --with-freetype \
        --with-jpeg \
        --with-webp \
    && docker-php-ext-install -j$(nproc) \
        pdo_mysql \
        mbstring \
        gd \
        zip \
        intl \
        pcntl \
        opcache \
        bcmath \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apk del .build-deps \
    && rm -rf /tmp/pear /var/cache/apk/*

# PHP config
COPY docker/php/php.ini      /usr/local/etc/php/conf.d/99-aikfs.ini
COPY docker/php/php-fpm.conf /usr/local/etc/php-fpm.d/zz-aikfs.conf

# Nginx config
COPY docker/nginx/nginx.conf     /etc/nginx/nginx.conf
COPY docker/nginx/default.conf   /etc/nginx/http.d/default.conf

# Supervisor config
COPY docker/supervisor/supervisord.conf /etc/supervisord.conf

# App
WORKDIR /var/www/html

COPY --from=composer-builder --chown=www-data:www-data /app        .
COPY --from=node-builder     --chown=www-data:www-data /app/public/build public/build

RUN mkdir -p storage/framework/{cache,sessions,views} \
             storage/app/public \
             bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
