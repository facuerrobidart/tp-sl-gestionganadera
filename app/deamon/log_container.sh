#!/bin/bash

# Ruta al escritorio (usando xdg-user-dir)
ESCRITORIO=$(xdg-user-dir DESKTOP)

# Archivo de logs
LOGFILE="$ESCRITORIO/logs.txt"

# Nombre del contenedor
CONTAINER_NAME="tp-sl-gestionganadera-app-1"

# Fecha actual
NOW=$(date "+%Y-%m-%d %H:%M:%S")

# Verificar si el contenedor existe y está en ejecución
if docker ps --format '{{.Names}}' | grep -q "^$CONTAINER_NAME$"; then
    # Crear archivo si no existe
    touch "$LOGFILE"

    # Obtener logs del último minuto y agregarlos al archivo, con encabezado de hora
    {
        echo "=== LOGS - $NOW ==="
        docker logs --since "60s" "$CONTAINER_NAME"
        echo ""  # Línea vacía para separar bloques
    } >> "$LOGFILE"
fi

# Eliminar logs con más de 1 día de antigüedad (basado en encabezados de fecha)
if [ -f "$LOGFILE" ]; then
    awk -v DATE="$(date -d '1 day ago' '+%Y-%m-%d %H:%M:%S')" '
        /^=== LOGS - / { curr = substr($0, 12); keep = (curr >= DATE) }
        keep || /^=== LOGS - / { print }
    ' "$LOGFILE" > "$LOGFILE.tmp" && mv "$LOGFILE.tmp" "$LOGFILE"
fi
