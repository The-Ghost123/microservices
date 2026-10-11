# Dockerfile
# Resep image untuk menjalankan cart-service (Laravel) di dalam container.

FROM php:8.4-cli

# Ekstensi pdo_pgsql dibutuhkan Laravel untuk terhubung ke PostgreSQL.
RUN apt-get update \
    && apt-get install -y --no-install-recommends libpq-dev unzip git \
    && docker-php-ext-install pdo_pgsql \
    && rm -rf /var/lib/apt/lists/*

# Composer dibawa dari image resminya, dipakai untuk memasang dependency.
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
ENV COMPOSER_ALLOW_SUPERUSER=1

WORKDIR /app
COPY . .
RUN composer install --no-interaction --prefer-dist --optimize-autoloader

EXPOSE 3001

# Jalankan migration dulu, baru nyalakan server.
CMD ["sh", "-c", "php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=3001"]
