#!/bin/bash
cd ~/github/sensors/
forever stop sensors.js
forever start -l /home/suslik/log/sensors/out -p /home/suslik -a -d sensors.js prod