#!/bin/bash
cd /home/z/my-project

# Double-fork to completely detach from parent
(while true; do
  node node_modules/.bin/next start -p 3000 2>&1 >> /home/z/my-project/dev.log
  echo "Server died at $(date), restarting in 3s..." >> /home/z/my-project/server-restart.log
  sleep 3
done) &
# Disown the background process
disown -a

# Exit the parent
exit 0
