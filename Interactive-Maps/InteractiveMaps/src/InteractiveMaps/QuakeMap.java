/**
 * QuakeMap
 * A map overlay for the application, shows dots on the map representing earthquakes and cities
 *
 * Author: UC San Diego Intermediate Software Development MOOC team
 * @author Henrique Salvadori Coelho
 *         Date: December 8, 2015
 */

package InteractiveMaps;

import de.fhpotsdam.unfolding.data.Feature;
import de.fhpotsdam.unfolding.data.GeoJSONReader;
import de.fhpotsdam.unfolding.data.PointFeature;
import de.fhpotsdam.unfolding.geo.Location;
import de.fhpotsdam.unfolding.marker.AbstractShapeMarker;
import de.fhpotsdam.unfolding.marker.Marker;
import de.fhpotsdam.unfolding.marker.MultiMarker;

import java.util.ArrayList;
import java.util.List;

public class QuakeMap {

  // Main program
  private InteractiveMaps _mainProgram;



  //====================================================================================================================
  // Constructor
  //====================================================================================================================

  public QuakeMap (InteractiveMaps mainProgram, String cityFile, String earthquakesURL) {

    _mainProgram = mainProgram;

    // Reading the city data
    List<Feature> cities = GeoJSONReader.loadData (_mainProgram, cityFile);
    _mainProgram.cityMarkers (new ArrayList<> ());
    for(Feature city : cities) _mainProgram.cityMarkers ().add(new CityMarker (city));

    // Reading earthquakes data
    List<PointFeature> earthquakes = ParseFeed.parseEarthquake (_mainProgram, earthquakesURL);
    _mainProgram.quakeMarkers (new ArrayList<>());
    for(PointFeature feature : earthquakes) {
      // Land or ocean?
      if(isLand(feature)) {
        _mainProgram.quakeMarkers ().add(new LandQuakeMarker (feature));
      } else {
        _mainProgram.quakeMarkers ().add(new OceanQuakeMarker(feature));
      }
    }
  }



  //====================================================================================================================
  // Misc
  //====================================================================================================================

  /**
   * isLand
   *
   * Checks whether this quake occurred on land. If it did, it sets the "country" property of its PointFeature to the
   * country where it occurred and returns true. Notice that the helper method isInCountry will set this "country"
   * property already.  Otherwise it returns false.
   *
   * @param earthquake - Feature with the earthquake to be checked
   * @return true if it occurred on land, false otherwise
   */
  private boolean isLand (PointFeature earthquake) {

    // Loop over all countries to check if location is in any of them. If it is, add 1 to the entry in countryQuakes
    // corresponding to this country.
    for (Marker country : _mainProgram.countryMarkers ()) {
      if (isInCountry(earthquake, country)) return true;
    }

    // Not inside any country
    return false;
  }


  /**
   * isInCountry
   *
   * Helper method to test whether a given earthquake is in a given country. This will also add the country property to
   * the properties of the earthquake feature if it's in one of the countries.
   *
   * @param earthquake to be tested
   * @param country to verify if the earthquake happened in it
   * @return true if the earthquake happened in the country
   */
  private boolean isInCountry(PointFeature earthquake, Marker country) {
    // Getting location of feature
    Location checkLoc = earthquake.getLocation ();

    // Some countries represented it as MultiMarker looping over SimplePolygonMarkers
    // which make them up to use isInsideByLoc
    if (country.getClass() == MultiMarker.class) {

      // Looping over markers making up MultiMarker
      for (Marker marker : ((MultiMarker)country).getMarkers()) {

        // Checking if inside
        if (((AbstractShapeMarker) marker).isInsideByLocation (checkLoc)) {
          earthquake.addProperty ("country", country.getProperty ("name"));

          // Return if is inside one
          return true;
        }
      }

      // Check if inside country represented by SimplePolygonMarker
    } else if (((AbstractShapeMarker) country).isInsideByLocation (checkLoc)) {
      earthquake.addProperty ("country", country.getProperty ("name"));
      return true;
    }
    return false;
  }


  /**
   * checkForClick
   *
   * Checks if a click happened in a city or an earthquake and hides/shows the cities and earthquakes
   */
  public void checkForClick () {
    if (_mainProgram.lastClicked () == null) {
      checkEarthquakesForClick ();
      if (_mainProgram.lastClicked () == null) {
        checkCitiesForClick ();
      }
    }
  }


  /**
   * checkCitiesForClick
   *
   * Helper method for checkForClick - This method checks if a click happened in a city and hides/shows the cities
   * and earthquakes
   */
  private void checkCitiesForClick()
  {
    if (_mainProgram.lastClicked () == null) {
      // Loop over the earthquake markers to see if one of them is selected
      for (Marker marker : _mainProgram.cityMarkers ()) {

        if (!marker.isHidden () && marker.isInside (_mainProgram.map (), _mainProgram.mouseX, _mainProgram.mouseY)) {
          _mainProgram.lastClicked ((CommonMarker) marker);

          // Hide all the other cities
          for (Marker mhide : _mainProgram.cityMarkers ()) {
            if (mhide != _mainProgram.lastClicked ()) {
              mhide.setHidden (true);
            }
          }

          // Hides the earthquakes that will not affect this city
          for (Marker mhide : _mainProgram.quakeMarkers ()) {
            EarthquakeMarker quakeMarker = (EarthquakeMarker) mhide;
            if (quakeMarker.getDistanceTo (marker.getLocation ())
              > quakeMarker.threatCircle ()) {
              quakeMarker.setHidden (true);
            }
          }
          break;
        }
      }
    }
  }


  /**
   * checkEarthquakesForClick
   *
   * Helper method for checkForClick - This method checks if a click happened in a city and hides/shows the cities
   * and earthquakes
   */
  private void checkEarthquakesForClick()
  {
    if (_mainProgram.lastClicked () == null) {
      // Loop over the earthquake markers to see if one of them is selected
      for (Marker m : _mainProgram.quakeMarkers ()) {
        EarthquakeMarker marker = (EarthquakeMarker) m;

        if (!marker.isHidden () && marker.isInside (_mainProgram.map (), _mainProgram.mouseX, _mainProgram.mouseY)) {
          _mainProgram.lastClicked ((CommonMarker) marker);

          // Hides all the other earthquakes
          for (Marker mhide : _mainProgram.quakeMarkers ()) {
            if (mhide != _mainProgram.lastClicked ()) {
              mhide.setHidden (true);
            }
          }

          // Hides the cities not affected
          for (Marker mhide : _mainProgram.cityMarkers ()) {
            if (mhide.getDistanceTo (marker.getLocation ())
              > marker.threatCircle ()) {
              mhide.setHidden (true);
            }
          }

          break;
        }
      }
    }
  }

}
