################################################################################
#
# SystemStatus
#
# This class represents the state of the the system. It is the structure of the
# state of the system (fans, lights, roof, etc)
# This object can be printed
#
##############################
#
# Author: Henrique Salvadori Coelho
# henriquesc@gmail.com
#
################################################################################


class SystemStatus:
    fansOn = False
    lightsOn = False
    roofOpen = False
    heatOn = False
    waterOn = False
    shadeOn = False
    blackoutOn = False

    # Constructor
    #
    # Sets the object in a safe empty state
    def __init__(self):
        self.fansOn = False
        self.lightsOn = False
        self.roofOpen = False
        self.heatOn = False
        self.waterOn = False
        self.shadeOn = False
        self.blackoutOn = False

    # __boolean_to_string
    #
    # Receives a boolean and returns a string with Yes or No
    @staticmethod
    def __boolean_to_string(status):
        if status == 1:
            return "Yes"
        elif status == 0:
            return "No"

    # __str__
    #
    # Makes the object printable
    def __str__(self):
        print("SYSTEM STATUS | Fans on: " +
              self.__boolean_to_string(self.fansOn))
        print("SYSTEM STATUS | Lights on: " +
              self.__boolean_to_string(self.lightsOn))
        print("SYSTEM STATUS | Roof is open: " +
              self.__boolean_to_string(self.roofOpen))
        print("SYSTEM STATUS | Heat on: " +
              self.__boolean_to_string(self.heatOn))
        print("SYSTEM STATUS | Water on: " +
              self.__boolean_to_string(self.waterOn))
        print("SYSTEM STATUS | Shades on: " +
              self.__boolean_to_string(self.shadeOn))
        print("SYSTEM STATUS | Blackout on: " +
              self.__boolean_to_string(self.blackoutOn))