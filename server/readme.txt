need to install some dependencies first to get the pi running. 

npm install --save rpi-gpio
npm install --save express
npm install --save socket.io
npm install mysql



####### gpio #########
most critical thing here is the rpi-gpio. Without that, there's no way to see what's going on with the GPIO. 

I had never done any sort of electronics short of soldering wires back together, so I followed some resources. You're going to need a photocell resistor, pins/wires, and a capacitor at the very least. The breadboard and ribbon cable help out a lot for learning.

https://learn.adafruit.com/basic-resistor-sensor-reading-on-raspberry-pi/basic-photocell-reading

http://www.raspberrypi-spy.co.uk/2012/08/reading-analogue-sensors-with-one-gpio-pin/

The basic rundown is that the gpio ports are digital which only read either 1 or 0, and the objective is to convert the analog signal (light) to a digital signal. This is achieved through the capacitor and photocell resistor.
Imagine the electricity flowing through the gpio is water. The photocell is a valve which can slow the water down to a a mere dribble. When the light is off, the valve is open. Light on, valve is closed. 
The capacitor acts as a bucket for the water to fill up. Once the water fills up the bucket, it dumps the water/electricity back to the pi generating a 1. While the water is filling the bucket, the signal is a 0. 

To determine if the light is on or off, the pi counts the milliseconds between when the signal changes from 0 to 1. The higher the millisecond count is, the higher the probability that the light is on. If the millisecond count is low, chances are the light is off. 


####### mysql #########
You can either have mysql installed locally on the pi (there isn't a huge overhead) or connect to it elsewhere. 

This is necessary to pull up historical data, return back the last session time (this one is very valuable), and the 'high score' for the day. 


####### pandora / pianobar #########
Outside of the app, it kicks off piano bar through the shell. There is a pianode npm out there, but I couldn't figure it out in ~30 minutes. 
I can't justify dropping too much time on this considering it's for the allure of listening to Madonna while taking a piss...

Here's the basic config of pianobar. 

wget -O pianobar.zip http://forums.adafruit.com/download/file.php?id=18707
unzip pianobar.zip
sudo mv pianobar /usr/local/bin
cat ~/.config/pianobar/config 

One thing I should note is that the autostart_station is a huge list of numbers - not the string of the station name. something like: 245656540810025646

You can also install pianobar through apt-get (sudo apt-get install pianobar), but at the time of getting everything running, the package manager version did not work with my pi. 
