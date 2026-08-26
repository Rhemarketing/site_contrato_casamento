#!/bin/sh
set -eu

require_environment_variable() {
  variable_name="$1"
  eval "variable_value=\${$variable_name:-}"
  if [ -z "$variable_value" ]; then
    echo "Variável obrigatória ausente: $variable_name" >&2
    exit 1
  fi
}

require_environment_variable DATABASE_URL
require_environment_variable AUTH_SECRET
require_environment_variable APP_URL
require_environment_variable AUTH_URL

if [ "${#AUTH_SECRET}" -lt 32 ]; then
  echo "AUTH_SECRET deve possuir ao menos 32 caracteres." >&2
  exit 1
fi

echo "Aplicando migrations do banco de dados..."
./node_modules/.bin/prisma migrate deploy

echo "Migrations aplicadas. Iniciando a aplicação..."
exec "$@"
