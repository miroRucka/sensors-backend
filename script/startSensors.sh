#!/bin/bash
cd ~/github/sensors-backend/
forever stop sensors-backend.js
forever start -l /home/suslik/log/sensors/out -p /home/suslik -a -d sensors-backend.js prod