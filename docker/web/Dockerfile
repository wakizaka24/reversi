FROM php:8.0-apache

# フォルダを事前に作成できる
# RUN mkdir /project

RUN apt-get update
RUN apt-get -y install vim
RUN pecl install xdebug
RUN docker-php-ext-enable xdebug
RUN docker-php-ext-install pdo_mysql