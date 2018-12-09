################################################################################
#
# Report
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


class Report:
    __report = {}

    # These variables represent the status of possible crops based on
    # the reports
    __status = {'HIGH': 1, 'GOOD': 0, 'LOW': -1, 'YES': 1, 'NO': 0}

    # CONSTRUCTOR
    #
    # Accepts the status of the crop and builds a report
    def __init__(self, humidity, temperature, raining, illumination):
        self.__report['humidity'] = {}
        self.__report['humidity']['value'] = humidity
        self.__report['humidity']['cropStatus'] = False

        self.__report['temperature'] = {}
        self.__report['temperature']['value'] = temperature
        self.__report['temperature']['cropStatus'] = False

        self.__report['raining'] = {}
        self.__report['raining']['value'] = raining

        self.__report['illumination'] = {}
        self.__report['illumination']['value'] = illumination
        self.__report['illumination']['cropStatus'] = False

    # __analyze_humidity
    #
    # Accepts a minimum and a maximum limit and calculates if the humidity is
    # within an accepted range or not. Returns a __status LOW, HIGH or GOOD
    def __analyze_humidity(self, min_humidity, max_humidity):
        current_humidity = self.__report['humidity']['value']
        if current_humidity < min_humidity:
            return self.__status['LOW']
        elif current_humidity > max_humidity:
            return self.__status['HIGH']
        else:
            return self.__status['GOOD']

    # __analyze_temperature
    #
    # Accepts a minimum and a maximum limit and calculates if the temperature is
    # within an accepted range or not. Returns a __status LOW, HIGH or GOOD
    def __analyze_temperature(self, min_temperature, max_temperature):
        current_temperature = self.__report['temperature']['value']
        if current_temperature < min_temperature:
            return self.__status['LOW']
        elif current_temperature > max_temperature:
            return self.__status['HIGH']
        else:
            return self.__status['GOOD']

    # __analyze_illumination
    #
    # Accepts a light threshold and calculates if the illumination is good, low
    # or high. Returns a __status GOOD, LOW or HIGH
    def __analyze_illumination(self, min_threshold, max_threshold):
        current_illumination = self.__report['illumination']['value']
        if current_illumination > min_threshold:
            return self.__status['LOW']
        elif current_illumination < max_threshold:
            return self.__status['HIGH']
        else:
            return self.__status['GOOD']

    # __analyze_light_cycle
    #
    # Accepts a light threshold and calculates if the illumination is good, low
    # or high. Returns a __status
    # GOOD, LOW or HIGH
    def __analyze_light_cycle(self, hour, hour_light_start, hour_light_end):
        if hour_light_start <= hour < hour_light_end:
            return self.__status['YES']
        else:
            return self.__status['NO']

    # get
    #
    # Returns the report of the environment (without the status of the crop)
    def get(self):
        return self.__report

    # build_crop_status
    #
    # Receives a Crop and generates the status of the crop based on the report
    # and the date
    def build_crop_status(self, crop, month, day, hour):
        # Getting the recommendation for the crop for this current date
        recommendation = crop.recommendation(month, day)

        # Building minimums and maximums for the crop
        min_humidity = int(recommendation['minSoilHumidity'])
        max_humidity = int(recommendation['maxSoilHumidity'])

        min_temperature = int(recommendation['minTemperature'])
        max_temperature = int(recommendation['maxTemperature'])

        min_light_threshold = int(recommendation['minLightThreshold'])
        max_light_threshold = int(recommendation['maxLightThreshold'])

        hour_light_start = int(recommendation['hourLightStart'])
        hour_light_end = int(recommendation['hourLightEnd'])

        # Building the report for the crop using the methods to analyze the data
        self.__report['humidity']['cropStatus']\
            = self.__analyze_humidity(min_humidity, max_humidity)
        self.__report['temperature']['cropStatus']\
            = self.__analyze_temperature(min_temperature, max_temperature)
        self.__report['illumination']['cropStatus']\
            = self.__analyze_illumination(min_light_threshold,
                                          max_light_threshold)
        self.__report['illumination']['mustBeLit']\
            = self.__analyze_light_cycle(hour, hour_light_start, hour_light_end)
