/**
 * LifeExpectancyMap
 * A map overlay for the application, shows shaded countries with their life expectancy.
 *
 * Author: UC San Diego Intermediate Software Development MOOC team
 * @author Henrique Salvadori Coelho
 *         Date: December 8, 2015
 */

package InteractiveMaps;

import de.fhpotsdam.unfolding.marker.Marker;
import de.fhpotsdam.unfolding.marker.MultiMarker;
import processing.core.PConstants;
import java.util.HashMap;
import java.util.List;

public class LifeExpectancyMap {

  // Life expectancy by country
  private HashMap<String, Float> _lifeByCountry;

  // Main program
  private InteractiveMaps _mainProgram;



  //====================================================================================================================
  // Constructor
  //====================================================================================================================

  public LifeExpectancyMap (InteractiveMaps mainProgram, String lifeExpectancyFile) {
    _mainProgram = mainProgram;

    // Loading Life Expectancy file
    _lifeByCountry = loadLifeExpectancyFromCSV(lifeExpectancyFile);

    // Shading the markers
    shadeCountries (_mainProgram.countryLifeExpectancyMarkers ());
  }



  //====================================================================================================================
  // Misc
  //====================================================================================================================

  /**
   * loadLifeExpectancyFromCSV
   *
   * Receives a CSV with the data, parses it and returns it the data in a hashmap
   *
   * @param fileName - Name of the file to be parsed
   *
   * @return a HashMap <String, Float> with the parsed data (Country code | Life expectancy (years))
   */
  private HashMap <String, Float> loadLifeExpectancyFromCSV (String fileName) {
    HashMap<String, Float> lifeExpMap = new HashMap<>();
    String[] rows = _mainProgram.loadStrings(fileName);
    for (String row : rows) {
      String[] columns = row.split(",");
      if (columns.length == 6 && !columns[5].equals("..")) {
        lifeExpMap.put(columns[4], Float.parseFloat(columns[5]));
      }
    }
    return lifeExpMap;
  }


  /**
   * shadeCountries
   *
   * Receives the country markers and shades them based on the data available
   *
   * @param countryMarkers - A list of markers with the country markers to be shaded
   */
  private void shadeCountries(List<Marker> countryMarkers) {
    for (Marker marker : countryMarkers) {
      String countryId = marker.getId ();
      if (_lifeByCountry.containsKey (countryId)) {
        float lifeExp = _lifeByCountry.get (countryId);
        int colorLevel = (int) _mainProgram.map(lifeExp, 40, 90, 10, 255);
        marker.setColor (_mainProgram.color (255 - colorLevel, 100, colorLevel));
      }
      else {
        marker.setColor (_mainProgram.color (150,150,150));
      }
    }
  }

  /**
   * showTitle
   *
   * Displays a popup box with the title for the marker next to the mouse cursor
   *
   * @param x - Coordinate x of the mouse cursor
   * @param y - Coordinate y of the mouse cursor
   * @param title - Title to be printed
   */
  private void showTitle(float x, float y, String title) {
    _mainProgram.rectMode (PConstants.CORNER);

    _mainProgram.stroke (110);
    _mainProgram.fill (255, 255, 255);
    _mainProgram.rect (x, y + 16, _mainProgram.textWidth(title) + 6, 18, 5);

    _mainProgram.textAlign (PConstants.LEFT, PConstants.TOP);
    _mainProgram.fill (0);
    _mainProgram.text (title, x + 3 , y + 18);
  }


  /**
   * displayCountryData
   *
   * If nothing else is already selected by the program, this function verifies if the mouse is hovering a country, and
   * if it is, displays the data in a popup box near the mouse cursor
   */
  public void displayCountryData () {
    if (_mainProgram.lastSelected () == null) {
      List<Marker> countryMarkers = _mainProgram.countryMarkers ();
      for (Marker country : countryMarkers) {
        MultiMarker countryMarker = new MultiMarker ();
        countryMarker.addMarkers (country);
        if (countryMarker.isInside (_mainProgram.map (), _mainProgram.mouseX, _mainProgram.mouseY)) {
          String title = country.getStringProperty ("name");
          if (_lifeByCountry.containsKey (country.getId ())) {
            title += ": " + _lifeByCountry.get (country.getId ()) + " years";
          } else {
            title += ": No data.";
          }
          showTitle (_mainProgram.mouseX, _mainProgram.mouseY, title);
          break;
        }
      }
    }
  }
}
