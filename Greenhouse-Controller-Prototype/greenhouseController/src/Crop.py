################################################################################
#
# Crop
#
# This class represents a crop, it contains all the requirements for this crop
# to be grown. These requirements are parsed from a CSV file.
#
##############################
#
# Author: Henrique Salvadori Coelho
# henriquesc@gmail.com
#
################################################################################

import csv


class Crop:
    __plantRequirements = {}

    # CONSTRUCTOR
    #
    # Accepts a csv file and parses it in the __plantRequirements dictionary
    def __init__(self, csv_file):

        field_names = ['month', 'day', 'minTemperature', 'maxTemperature',
                       'minSoilHumidity', 'maxSoilHumidity',
                       'minLightThreshold', 'maxLightThreshold',
                       'hourLightStart', 'hourLightEnd']

        reader = csv.DictReader(open(csv_file, 'rb'),
                                fieldnames=field_names,
                                delimiter=',',
                                quotechar='"')

        first_line = True
        for row in reader:
            if first_line:
                first_line = False
                continue
            if row['month'] not in self.__plantRequirements:
                self.__plantRequirements[row['month']] = {}
            if row['day'] not in self.__plantRequirements[row['month']]:
                self.__plantRequirements[row['month']][row['day']] = {}
            for key in row:
                self.__plantRequirements[row['month']][row['day']][key]\
                    = row[key]

    # __get_closest_day
    #
    # Receives a day and a month and returns the closest day in that
    # month that has a recommendation (looks only for days before the
    # specified date)
    def __get_closest_day(self, month, day):
        days = []
        month = str(month)
        if month not in self.__plantRequirements:
            return False
        for row in self.__plantRequirements[month]:
            days.append(row)
        while day > 0:
            if str(day) in days:
                return day
            else:
                day -= 1
        return False

    # recommendation
    #
    # Receives a day and a month and returns the recommendation for
    # that period of time. If there are no recommendations, returns false
    def recommendation(self, month, day):
        if len(self.__plantRequirements) == 0:
            return False

        found_month = month
        found_day = day

        months_looped = 0
        closest_day = self.__get_closest_day(found_month, found_day)
        while (str(found_month) not in self.__plantRequirements or
               closest_day is False):
            found_month -= 1
            if found_month == 0:
                found_month = 12
            found_day = 31
            months_looped += 1
            if months_looped > 12:
                return
            closest_day = self.__get_closest_day(found_month, found_day)

        return self.__plantRequirements[str(found_month)][str(closest_day)]
