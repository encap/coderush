#!/bin/sh
FAILS=0
d="+%H:%M:%S %d.%m.%Y"
echo "$(date "$d") - Script started"
sleep 180

while :
do
ping -c 2 -w 1 1.1.1.1 > /dev/null

if [ $? -ne 0 ]; then
    echo "$(date "$d") - Ping failed"
    let "FAILS++"
    if [ $FAILS -eq 1 ]; then
        echo "Auto repair"
        ifup wwan
        sleep 60
    elif [ $FAILS -eq 2]; then
        echo "Reboot"
        reboot
    fi
else
	  FAILS=0
fi

sleep 20
done