#!/bin/bash
cd /home/z/my-project
while true; do
  npx next dev -p 3000 2>&1 | tee dev.log
  echo "Server died at $(date), restarting in 3s..." >> /tmp/next-restarts.log
  sleep 3
done
