# Dockerfile
# Resep image untuk menjalankan order-service (Laravel) di dalam container.

FROM php:8.4-cli

# Ekstensi pdo_mysql dibutuhkan Laravel untuk terhubung ke database MySQL.
RUN apt-get update \
    && apt-get install -y --no-install-recommends unzip git \
    && docker-php-ext-install pdo_mysql \
    && rm -rf /var/lib/apt/lists/*

# Composer dibawa dari image resminya, dipakai untuk memasang dependency.
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
ENV COMPOSER_ALLOW_SUPERUSER=1

WORKDIR /app
COPY . .
RUN composer install --no-interaction --prefer-dist --optimize-autoloader

EXPOSE 3003

# Jalankan migration dulu, baru nyalakan server.
CMD ["sh", "-c", "php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=3003 --no-reload"]
