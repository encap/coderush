#!/bin/bash

read_var() {
    VAR=$(grep $1 $2 | xargs)
    IFS="=" read -ra VAR <<< "$VAR"
    echo ${VAR[1]}
}

FAUNA_KEY=$(read_var FAUNA_KEY .env.local)
FAUNA_DEV_KEY=$(read_var FAUNA_DEV_KEY .env.local)

cd /home/fdm && exec ./fdm --verbose -source key=$FAUNA_KEY -dest key=$FAUNA_DEV_KEY