# 🐳 Docker Log Daemon: log_container.sh

Este script guarda los logs del contenedor Docker llamado `tp-sl-gestionganadera-app-1` en un archivo `logs.txt` ubicado en tu **Escritorio**. También elimina los logs con más de un día de antigüedad.

---

## ⚙️ Requisitos

- Docker instalado y funcionando. El usuario debe estar en el grupo docker
- Bash y `cron` disponibles.
- El comando `xdg-user-dir` (instalado por defecto en la mayoría de escritorios Linux). Si no lo tenés:
  ```bash
  sudo apt install xdg-user-dirs
  ```

---

## 📦 Instalación y configuración

### 1. Descargar el script

Descargá el archivo `log_container.sh` y guardalo en home/user (o sea, en ~)


### 2. Dar permisos de ejecución

```bash
chmod +x ~/log_container.sh
```

---

### 3. Configurar ejecución automática con `cron`

Abrí el editor de cron:

```bash
crontab -e
```

Y agregá esta línea al final:

```cron
*/5 * * * * /bin/bash $HOME/log_container.sh
```

Esto ejecutará el script **cada 5 minutos**.


## 📁 ¿Qué hace exactamente?

- Revisa si el contenedor `tp-sl-gestionganadera-app-1` está en ejecución.
- Si está corriendo:
  - Concatena los logs nuevos en `~/Escritorio/logs.txt`.
  - Agrega un encabezado con fecha y hora.
- Elimina automáticamente los bloques de logs que tengan más de 24 horas de antigüedad.

---



## 🧼 Desinstalar

Para detener el daemon:

1. Quitá la línea correspondiente en `crontab -e`.
2. Eliminá el archivo `log_container.sh` si lo deseás.

---


