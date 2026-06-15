#!/bin/bash
# Dev server daemon - keeps Next.js running with auto-restart
LOGFILE="/home/z/my-project/dev.log"
PIDFILE="/home/z/my-project/.dev-server.pid"

cleanup() {
    rm -f "$PIDFILE"
    exit 0
}
trap cleanup SIGTERM SIGINT

echo $$ > "$PIDFILE"

while true; do
    cd /home/z/my-project
    echo "[$(date)] Starting Next.js dev server..." >> "$LOGFILE"
    node node_modules/.bin/next dev -p 3000 >> "$LOGFILE" 2>&1
    EXIT_CODE=$?
    echo "[$(date)] Next.js exited with code $EXIT_CODE. Restarting in 3s..." >> "$LOGFILE"
    sleep 3
done
