#!/bin/sh
ssh -t root@146.185.157.182 'cd /strem.io && git pull && npm install --prune && systemctl daemon-reload && systemctl restart stremio'

