#!/bin/bash
cd "$(dirname "$0")"
if ! lsof -i :3030 > /dev/null 2>&1; then
    python3 -m http.server 3030 &
    sleep 0.8
fi
open "http://localhost:3030"
