# Greenhouse-Controller-Prototype
Prototype for automated greenhouse system.
This system assumes you have the following sensors connected to a Raspberry Pi:
* Temperature sensor
* Humidity sensor
* Brightness sensor
* Rain detector

The file Plant.csv is a database file that contains the optimal environment data for a crop.

The system reads the data from the sensors and, based on the data from the database, determines which actuators must be active in the greenhouse.
The actuators were represented by LEDs connected to output GPIO ports, they represent:
* Heating system
* Fans
* Roofs (can be closed or opened)
* Watering system
* Shades
* Blackout curtains

The system also includes a "start" file that should be used as the executable (UNIX/Linux/MacOS) for the script. This file gives access to a single instance of the program (avoiding parallel instances) which can be accessed from any computer over the internet.

The main menu contains the current state of the system and also tools to override the status of the actuators.


HENRIQUE SALVADORI COELHO - henriquesc@gmail.com - hcoelho.com
