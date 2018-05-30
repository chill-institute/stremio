#!/bin/sh
ssh -t root@146.185.138.21 'cd /strem.io && git pull && npm install --prune && systemctl daemon-reload && systemctl restart stremio'

