################################################################################
#
# SystemController
#
# This class represents the state of the environment. Initially, it receives the
# readings from the sensors and can build a report based on a crop passed to it
#
##############################
#
# Author: Henrique Salvadori Coelho
# henriquesc@gmail.com
#
################################################################################

from SystemStatus import SystemStatus


class SystemController:
    __status = False
    __pins = False
    __GPIO = False

    # Constructor
    #
    # Receives a list of pins and GPIOs to control the output for the system
    def __init__(self, pins, gpio):
        self.__status = SystemStatus()
        self.__pins = pins
        self.__GPIO = gpio

    # Turn on/off / Open / Close
    #
    # These methods are used to turn on/off the parts of the system
    def turn_on_fans(self):
        self.__status.fansOn = True

    def turn_off_fans(self):
        self.__status.fansOn = False

    def turn_on_lights(self):
        self.__status.lightsOn = True

    def turn_off_lights(self):
        self.__status.lightsOn = False

    def turn_on_heat(self):
        self.__status.heatOn = True

    def turn_off_heat(self):
        self.__status.heatOn = False

    def turn_on_water(self):
        self.__status.waterOn = True

    def turn_off_water(self):
        self.__status.waterOn = False

    def turn_on_shade(self):
        self.__status.shadeOn = True

    def turn_off_shade(self):
        self.__status.shadeOn = False

    def turn_on_blackout(self):
        self.__status.blackoutOn = True

    def turn_off_blackout(self):
        self.__status.blackoutOn = False

    def open_roof(self):
        self.__status.roofOpen = True

    def close_roof(self):
        self.__status.roofOpen = False

    # update_status
    #
    # Receives a report and a list of overridden commands which are then used
    # to update the system.
    # It returns a list with the status of the system.
    def update_status(self, report, override):
        # Processing the report - updates the status of the system only based
        # on the report, but the overridden commands still have to be evaluated
        self.__process_report(report)

        # Overriding commands
        if 'fansOn' in override:
            fan_ovr_status = ' OVERRIDDEN WITH: ' + str(override['fansOn'])
            fan_status = override['fansOn']
        else:
            fan_ovr_status = ''
            fan_status = self.__status.fansOn

        if 'roofOpen' in override:
            roof_ovr_status = ' OVERRIDDEN WITH: ' + str(override['roofOpen'])
            roof_status = override['roofOpen']
        else:
            roof_ovr_status = ''
            roof_status = self.__status.roofOpen

        if 'heatOn' in override:
            heat_ovr_status = ' OVERRIDDEN WITH: ' + str(override['heatOn'])
            heat_status = override['heatOn']
        else:
            heat_ovr_status = ''
            heat_status = self.__status.heatOn

        if 'waterOn' in override:
            water_ovr_status = ' OVERRIDDEN WITH: ' + str(override['waterOn'])
            water_status = override['waterOn']
        else:
            water_ovr_status = ''
            water_status = self.__status.waterOn

        if 'shadeOn' in override:
            shade_ovr_status = ' OVERRIDDEN WITH: ' + str(override['shadeOn'])
            shade_status = override['shadeOn']
        else:
            shade_ovr_status = ''
            shade_status = self.__status.shadeOn

        if 'blackoutOn' in override:
            blackout_ovr_status = ' OVERRIDDEN WITH: ' +\
                                  str(override['blackoutOn'])
            blackout_status = override['blackoutOn']
        else:
            blackout_ovr_status = ''
            blackout_status = self.__status.blackoutOn

        if 'lightsOn' in override:
            lights_ovr_status = ' OVERRIDDEN WITH: ' + str(override['lightsOn'])
            lights_status = override['lightsOn']
        else:
            lights_ovr_status = ''
            lights_status = self.__status.lightsOn

        # Updating the system
        self.__GPIO.output(self.__pins['fan'], fan_status)
        self.__GPIO.output(self.__pins['roof'], roof_status)
        self.__GPIO.output(self.__pins['heat'], heat_status)
        self.__GPIO.output(self.__pins['water'], water_status)
        self.__GPIO.output(self.__pins['shade'], shade_status)
        self.__GPIO.output(self.__pins['blackout'], blackout_status)
        self.__GPIO.output(self.__pins['light'], lights_status)

        return ['SYSTEM FAN: ' + str(self.__status.fansOn) + fan_ovr_status,

                'SYSTEM ROOF: ' + str(self.__status.roofOpen) + roof_ovr_status,

                'SYSTEM HEAT: ' + str(self.__status.heatOn) + heat_ovr_status,

                'SYSTEM WATER: ' + str(self.__status.waterOn) +
                water_ovr_status,

                'SYSTEM SHADE: ' + str(self.__status.shadeOn) +
                shade_ovr_status,

                'SYSTEM BLACKOUT: ' + str(self.__status.blackoutOn) +
                blackout_ovr_status,

                'SYSTEM LIGHTS: ' + str(self.__status.lightsOn) +
                lights_ovr_status]

    # __process_report
    #
    # This method receives a report and updates the status of the system based
    # on it
    def __process_report(self, report):
        if report['temperature']['cropStatus'] > 0:
            # It's too hot
            self.turn_on_fans()
            self.turn_off_heat()

            if report['raining']['value']:
                # It's raining
                self.close_roof()
            else:
                # It's not raining
                self.open_roof()
        else:
            # It's not too hot
            self.turn_off_fans()
            self.close_roof()

            if report['temperature']['cropStatus'] < 0:
                # It's too cold
                self.turn_on_heat()
            else:
                self.turn_off_heat()

        if not report['illumination']['mustBeLit']:
            # It should be dark
            self.turn_on_blackout()
            self.turn_off_lights()
        else:
            # It should not be dark
            self.turn_off_blackout()

            if report['illumination']['cropStatus'] >= 0:
                # There's enough light
                self.turn_off_lights()
            else:
                # There's not enough light
                self.turn_on_lights()

            if report['illumination']['cropStatus'] > 0:
                # There's too much light, shade is needed
                self.turn_on_shade()
            else:
                # There's not too much light, shade is not needed
                self.turn_off_shade()

        if report['humidity']['cropStatus'] < 0:
            # It's too dry
            self.turn_on_water()
        elif report['humidity']['cropStatus'] > 0:
            # It's too wet
            self.turn_off_water()
