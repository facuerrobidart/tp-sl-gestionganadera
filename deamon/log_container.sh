#!/bin/bash


# archivo de logs
LOGFILE="$HOME/tp-sl-gestionganadera.log"

# nombre del contenedor
CONTAINER_NAME="tp-sl-gestionganadera-app-1"

# fecha actual
NOW=$(date "+%Y-%m-%d %H:%M:%S")

# verificar si el contenedor existe y está en ejecución
if docker ps --format '{{.Names}}' | grep -q "^$CONTAINER_NAME$"; then
    # crear archivo si no existe
    touch "$LOGFILE"

    # obtener logs del último minuto y agregarlos al archivo, con encabezado de hora
    {
        echo "=== LOGS - $NOW ==="
        docker logs --since "60s" "$CONTAINER_NAME"
        echo ""  # Línea vacía para separar bloques
    } >> "$LOGFILE"
fi

# eliminar logs con más de 1 día de antigüedad
if [ -f "$LOGFILE" ]; then
    awk -v DATE="$(date -d '1 day ago' '+%Y-%m-%d %H:%M:%S')" '
        /^=== LOGS - / { curr = substr($0, 12); keep = (curr >= DATE) }
        keep || /^=== LOGS - / { print }
    ' "$LOGFILE" > "$LOGFILE.tmp" && mv "$LOGFILE.tmp" "$LOGFILE"
fi
