#!/bin/sh

if [ $1 = "dev" ]; then
shift
echo "Leo! running dev $1"
docker-compose -f docker-compose.yml -f dev.yml up $1

elif [ $1 = "prod" -o $1 = "production" ]; then
shift
echo "Leo! running production $1"
docker-compose -f docker-compose.yml -f production.yml up $1

fi
