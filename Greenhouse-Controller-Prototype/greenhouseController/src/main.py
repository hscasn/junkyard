#!/usr/bin/env python

################################################################################
# main
#
# Main file of the program. This file contains the setup and loop functions, as
# well as the methods to read the sensors and output the console
##############################
#
# Author: Henrique Salvadori Coelho
# henriquesc@gmail.com
#
################################################################################

# DEPENDENCIES
import sys
sys.path.insert(0, 'dependencies/')
import RPi.GPIO as GPIO
import time
import os
import Adafruit_DHT as DHT
import PCF8591 as ADC
import RPi.GPIO as GPIO
import datetime
import thread

from Crop import Crop
from Report import Report
from SystemController import SystemController

# DEBUG MODE
# Set 'DEBUG' to True if you want to use custom values and False otherwise
# Set the other individual values to the ones you want. If you wish to use
# the reading from the sensors even when debugging, set them to False
DEBUG = False  # Bool
DEBUG_TEMPERATURE = 10  # Int
DEBUG_RAIN = False  # Bool
DEBUG_HUMIDITY = False  # Int
DEBUG_LIGHT = False  # Int
DEBUG_DAY = False  # Int
DEBUG_MONTH = False  # Int
DEBUG_HOUR = False  # Int

# DEFINING PINS AND SENSORS
RAIN_SENSOR_PIN = 13
TEMPERATURE_SENSOR = False
HUMITURE_SENSOR = 11
HUMITURE_PIN = 17
FAN_PIN = 29  # GPIO 5
ROOF_PIN = 31  # GPIO 6
HEAT_PIN = 33  # GPIO 13
WATER_PIN = 35  # GPIO 19
SHADE_PIN = 37  # GPIO 26
BLACKOUT_PIN = 22  # GPIO 25
LIGHT_PIN = 16  # GPIO 23
SYSTEM_PINS = {'fan': FAN_PIN, 'roof': ROOF_PIN, 'heat': HEAT_PIN,
               'light': LIGHT_PIN, 'water': WATER_PIN, 'shade': SHADE_PIN,
               'blackout': BLACKOUT_PIN}

# GLOBAL STATUS
IS_RAINING = False
CURRENT_TEMPERATURE = 0
SOIL_HUMIDITY = 0
SOIL_TEMPERATURE = 0
CURRENT_ILLUMINATION = 0

# TEMPORARY MEMORY FOR LAST READINGS
LAST_RAIN_READING = 0
LAST_TEMPERATURE_READING = 0
LAST_ILLUMINATION_READING = 0

# TOLERANCE FOR DATA UPDATING
TOLERANCE_TEMPERATURE = 2
TOLERANCE_SOIL_HUMIDITY = 2
TOLERANCE_SOIL_TEMPERATURE = 2
TOLERANCE_ILLUMINATION = 2

# GLOBALS
CURRENT_DAY = 0
CURRENT_MON = 0
CURRENT_HOUR = 0
CROP = False
SYSTEM_CONTROLLER = False
CURRENT_CROP_REPORT = False
CURRENT_SYSTEM_REPORT = False
UPDATE_SYSTEM = True

# OVERRIDDEN CONTROLS
SYSTEM_OVERRIDE = {}

# TIME BETWEEN READINGS
READINGS_DELAY = 0.5

# LISTENING FOR INPUT OR VERBOSE MODE?
VERBOSE = False


# get_time_stamp
#
# Returns a string with the current timestamp
def get_time_stamp():
    current_time = time.ctime()
    return current_time


# print_line
#
# Used to print a reading from the sensors, append a timestamp
# before it
def print_line(string):
    global VERBOSE
    if VERBOSE:
        print (get_time_stamp() + ' | ' + string)


# read_temperature
#
# Reads the temperature file the sensor created and sets the
# global variable CURRENT_TEMPERATURE in celsius
def read_temperature():
    global TEMPERATURE_SENSOR
    global CURRENT_TEMPERATURE
    global LAST_TEMPERATURE_READING

    location = '/sys/bus/w1/devices/' + TEMPERATURE_SENSOR + '/w1_slave'
    text_file = open(location)
    text = text_file.read()
    text_file.close()
    second_line = text.split('\n')[1]
    temperature_data = second_line.split(' ')[9]
    temperature = float(temperature_data[2:])

    CURRENT_TEMPERATURE = temperature / 1000

    upper_threshold_reached = (CURRENT_TEMPERATURE > LAST_TEMPERATURE_READING +
                               TOLERANCE_TEMPERATURE)

    lower_threshold_reached = (CURRENT_TEMPERATURE < LAST_TEMPERATURE_READING -
                               TOLERANCE_TEMPERATURE)

    if upper_threshold_reached or lower_threshold_reached:
        if CURRENT_TEMPERATURE is not None:
            LAST_TEMPERATURE_READING = CURRENT_TEMPERATURE
            print_line('CURRENT_TEMPERATURE: %0.3F C' % CURRENT_TEMPERATURE)
            return True
        else:
            print_line('!!! TEMPERATURE READING FAIL !!!')
    return False


# read_rain
#
# Reads the digital input for rain and sets the global
# variable IS_RAINING to True in case it is raining, or
# false otherwise
def read_rain():
    global LAST_RAIN_READING
    global IS_RAINING
    rain_reading = GPIO.input(RAIN_SENSOR_PIN)
    if rain_reading != LAST_RAIN_READING:
        LAST_RAIN_READING = rain_reading
        if rain_reading == 0:
            IS_RAINING = True
            print_line('RAINING: TRUE')
        else:
            IS_RAINING = False
            print_line('RAINING: FALSE')
        return True
    return False


# read_soil_humiture
#
# Reads the soil humidity and temperature and updates the global
# variables SOIL_HUMIDITY and SOIL_TEMPERATURE
def read_soil_humiture():
    global SOIL_HUMIDITY
    global SOIL_TEMPERATURE
    humidity, temperature = DHT.read_retry(HUMITURE_SENSOR, HUMITURE_PIN)
    if humidity is not None and temperature is not None:
        had_update = False
        if (humidity > SOIL_HUMIDITY + TOLERANCE_SOIL_HUMIDITY or
                humidity < SOIL_HUMIDITY - TOLERANCE_SOIL_HUMIDITY):
            SOIL_HUMIDITY = humidity
            print_line('SOIL HUMIDITY: %0.3F' % SOIL_HUMIDITY)
            had_update = True
        if (temperature > SOIL_TEMPERATURE + TOLERANCE_SOIL_TEMPERATURE or
                temperature < SOIL_TEMPERATURE - TOLERANCE_SOIL_TEMPERATURE):
            SOIL_TEMPERATURE = temperature
            print_line('SOIL TEMPERATURE: %0.3fC' % SOIL_TEMPERATURE)
            had_update = True
        return had_update
    else:
        print_line('!!! HUMITURE READING FAIL !!!')
    return False


# read_illumination
#
# Reads the current illuminationa and updates the global CURRENT_ILLUMINATION
def read_illumination():
    global CURRENT_ILLUMINATION
    illumination = ADC.read(0)
    if (illumination > CURRENT_ILLUMINATION + TOLERANCE_ILLUMINATION or
            illumination < CURRENT_ILLUMINATION - TOLERANCE_ILLUMINATION):
        CURRENT_ILLUMINATION = illumination
        print_line('CURRENT ILLUMINATION: %0.3f' % CURRENT_ILLUMINATION)
        return True
    return False


# override_debug_values
#
# If the debug mode is active, overrides the global values with the debug
# values
def override_debug_values():
    global DEBUG_TEMPERATURE
    global DEBUG_RAIN
    global DEBUG_HUMIDITY
    global DEBUG_LIGHT
    global SOIL_HUMIDITY
    global CURRENT_TEMPERATURE
    global IS_RAINING
    global CURRENT_ILLUMINATION

    if DEBUG_TEMPERATURE is not False:
        CURRENT_TEMPERATURE = DEBUG_TEMPERATURE
        print_line('DEBUGGING WITH TEMPERATURE AS: ' + str(CURRENT_TEMPERATURE))
    if DEBUG_RAIN is not False:
        IS_RAINING = DEBUG_RAIN
        print_line('DEBUGGING WITH RAIN AS: ' + str(IS_RAINING))
    if DEBUG_HUMIDITY is not False:
        SOIL_HUMIDITY = DEBUG_HUMIDITY
        print_line('DEBUGGING WITH HUMIDITY AS: ' + str(SOIL_HUMIDITY))
    if DEBUG_LIGHT is not False:
        CURRENT_ILLUMINATION = DEBUG_LIGHT
        print_line('DEBUGGING WITH LIGHT AS: ' + str(CURRENT_ILLUMINATION))


# clear_screen
#
# Prints new lines to clear the screen
def clear_screen():
    for i in range(60):
        print('')


# display_menu
#
# Displays the program's main menu
def display_menu():
    clear_screen()
    if not CURRENT_CROP_REPORT or not CURRENT_SYSTEM_REPORT:
        print ('Loading...')
    while not CURRENT_CROP_REPORT or not CURRENT_SYSTEM_REPORT:
        time.sleep(0.1)
    clear_screen()
    time_stamp = get_time_stamp()
    print('------------- MAIN MENU -------------')
    print('')
    print('--- Crop Status as in ' + time_stamp)
    print(CURRENT_CROP_REPORT)
    print('')
    print('--- System Status as in ' + time_stamp)
    print(CURRENT_SYSTEM_REPORT)
    print('--- Controls')
    print('Type a command to continue:')
    print('update - Updates this screen with the current status')
    print('report - Display system report')
    print('         (press ENTER to return to the main menu')
    print('reset  - Resets the overridden settings')
    print('')
    print('Commands for system overriding:')
    print('e.g. water on')
    print('roof     [open/close] - Opens or closes the roof')
    print('lights   [on/off] - Turns the lights on/off')
    print('fans     [on/off] - Turns the fans on/off')
    print('water    [on/off] - Turns the water on/off')
    print('shade    [on/off] - Turns the shades on/off')
    print('blackout [on/off] - Turns the blackouts on/off')
    print('heat     [on/off] - Turns the heating system on/off')


# build_crop_report
#
# Accepts a report for a crop and returns a printable string with the info
def build_crop_report(crop_report):
    report_string = ''

    report_string += ' .Raining: ' + str(crop_report['raining']['value']) + '\n'

    report_string += ' .Illumination: ' +\
                     str(crop_report['illumination']['value']) + '\n'

    report_string += ' .Temperature: ' +\
                     str(crop_report['temperature']['value']) + 'C\n'

    report_string += ' .Humidity: ' + str(crop_report['humidity']['value']) +\
                     '%\n'
    return report_string


# reset_updates_and_reports
#
# Forces the system to be updated and empties the reports
def reset_updates_and_reports():
    global UPDATE_SYSTEM
    global CURRENT_CROP_REPORT
    global CURRENT_SYSTEM_REPORT
    UPDATE_SYSTEM = True
    CURRENT_CROP_REPORT = False
    CURRENT_SYSTEM_REPORT = False


# listen_for_input
#
# If in verbose mode, waits until the user presses ENTER and then shows the
# main menu. If not in verbose mode, displays the main menu and waits for
# user input
def listen_for_input():
    global VERBOSE
    global SYSTEM_OVERRIDE

    while True:
        if VERBOSE:
            clear_screen()
            print('Displaying system report:')
            print('Press ENTER to return to the main menu...')
            raw_input()
            VERBOSE = False  # If it reaches here, the user typed something
        else:
            display_menu()
            user_input = raw_input('> ')
            if user_input == 'report':
                VERBOSE = True
            elif user_input == 'update':
                reset_updates_and_reports()
            elif user_input == 'reset':
                SYSTEM_OVERRIDE = {}
                reset_updates_and_reports()
            elif user_input == 'lights on':
                SYSTEM_OVERRIDE['lightsOn'] = True
                reset_updates_and_reports()
            elif user_input == 'lights off':
                SYSTEM_OVERRIDE['lightsOn'] = False
                reset_updates_and_reports()
            elif user_input == 'roof open':
                SYSTEM_OVERRIDE['roofOpen'] = True
                reset_updates_and_reports()
            elif user_input == 'roof close':
                SYSTEM_OVERRIDE['roofOpen'] = False
                reset_updates_and_reports()
            elif user_input == 'fans on':
                SYSTEM_OVERRIDE['fansOn'] = True
                reset_updates_and_reports()
            elif user_input == 'fans off':
                SYSTEM_OVERRIDE['fansOn'] = False
                reset_updates_and_reports()
            elif user_input == 'water on':
                SYSTEM_OVERRIDE['waterOn'] = True
                reset_updates_and_reports()
            elif user_input == 'water off':
                SYSTEM_OVERRIDE['waterOn'] = False
                reset_updates_and_reports()
            elif user_input == 'shade on':
                SYSTEM_OVERRIDE['shadeOn'] = True
                reset_updates_and_reports()
            elif user_input == 'shade off':
                SYSTEM_OVERRIDE['shadeOn'] = False
                reset_updates_and_reports()
            elif user_input == 'blackout on':
                SYSTEM_OVERRIDE['blackoutOn'] = True
                reset_updates_and_reports()
            elif user_input == 'blackout off':
                SYSTEM_OVERRIDE['blackoutOn'] = False
                reset_updates_and_reports()
            elif user_input == 'heat on':
                SYSTEM_OVERRIDE['heatOn'] = True
                reset_updates_and_reports()
            elif user_input == 'heat off':
                SYSTEM_OVERRIDE['heatOn'] = False
                reset_updates_and_reports()
            else:
                print('Unknown command: ' + str(user_input))


# setup
#
# Sets the sensors and output up
def setup():
    global CURRENT_DAY
    global CURRENT_MON
    global CURRENT_HOUR
    global CROP
    global SYSTEM_CONTROLLER

    GPIO.setmode(GPIO.BOARD)
    GPIO.setup(RAIN_SENSOR_PIN, GPIO.IN)
    ADC.setup(0x48)

    global TEMPERATURE_SENSOR
    for i in os.listdir('/sys/bus/w1/devices'):
        if i != 'w1-bus-master1':
            TEMPERATURE_SENSOR = i

    print('== Program starting ==')

    GPIO.setup(FAN_PIN, GPIO.OUT)
    GPIO.setup(ROOF_PIN, GPIO.OUT)
    GPIO.setup(HEAT_PIN, GPIO.OUT)
    GPIO.setup(WATER_PIN, GPIO.OUT)
    GPIO.setup(SHADE_PIN, GPIO.OUT)
    GPIO.setup(BLACKOUT_PIN, GPIO.OUT)
    GPIO.setup(LIGHT_PIN, GPIO.OUT)

    CURRENT_DAY = datetime.datetime.today().day
    CURRENT_MON = datetime.datetime.today().month
    CURRENT_HOUR = datetime.datetime.today().hour

    CROP = Crop('plant.csv')
    SYSTEM_CONTROLLER = SystemController(SYSTEM_PINS, GPIO)

    # Starting thread for user input
    thread.start_new_thread(listen_for_input, ())


# Loop
def loop():
    global CURRENT_DAY
    global CURRENT_MON
    global CURRENT_HOUR
    global CROP
    global SYSTEM_CONTROLLER
    global SOIL_HUMIDITY
    global CURRENT_TEMPERATURE
    global IS_RAINING
    global CURRENT_ILLUMINATION
    global READINGS_DELAY
    global DEBUG
    global DEBUG_DAY
    global DEBUG_MONTH
    global DEBUG_HOUR
    global SYSTEM_OVERRIDE
    global CURRENT_CROP_REPORT
    global CURRENT_SYSTEM_REPORT
    global UPDATE_SYSTEM

    while True:
        if read_rain():
            UPDATE_SYSTEM = True
        if read_temperature():
            UPDATE_SYSTEM = True
        if read_soil_humiture():
            UPDATE_SYSTEM = True
        if read_illumination():
            UPDATE_SYSTEM = True

        if UPDATE_SYSTEM:
            print_line('UPDATING SYSTEM')
            CURRENT_DAY = datetime.datetime.today().day
            CURRENT_MON = datetime.datetime.today().month
            CURRENT_HOUR = datetime.datetime.today().hour

            # Overriding date/time if debugging
            if DEBUG:
                override_debug_values()
                if DEBUG_DAY is not False:
                    CURRENT_DAY = DEBUG_DAY
                    print_line('DEBUGGING WITH DAY AS: ' + str(CURRENT_DAY))
                if DEBUG_MONTH is not False:
                    CURRENT_MON = DEBUG_MONTH
                    print_line('DEBUGGING WITH MONTH AS: ' + str(CURRENT_MON))
                if DEBUG_HOUR is not False:
                    CURRENT_HOUR = DEBUG_HOUR
                    print_line('DEBUGGING WITH HOUR AS: ' + str(CURRENT_HOUR))

            report = Report(SOIL_HUMIDITY, CURRENT_TEMPERATURE, IS_RAINING,
                            CURRENT_ILLUMINATION)
            report.build_crop_status(CROP, CURRENT_MON, CURRENT_DAY,
                                     CURRENT_HOUR)
            crop_report = report.get()
            update_status = SYSTEM_CONTROLLER.update_status(crop_report,
                                                            SYSTEM_OVERRIDE)

            CURRENT_CROP_REPORT = build_crop_report(crop_report)

            CURRENT_SYSTEM_REPORT = ''
            for status in update_status:
                print_line(' .' + status)
                CURRENT_SYSTEM_REPORT += ' .' + status + '\n'

            UPDATE_SYSTEM = False
        time.sleep(READINGS_DELAY)


# DESTRUCTOR
def destroy():
    GPIO.cleanup()
    ADC.write(0)


# MAIN
if __name__ == '__main__':
    setup()
    try:
        loop()
    except KeyboardInterrupt:
        destroy()
