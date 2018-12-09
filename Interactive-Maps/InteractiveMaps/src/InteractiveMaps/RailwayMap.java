/**
 * RailwayMap
 * A map overlay for the application, shows shaded countries with their railway density
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
import java.util.Map;


public class RailwayMap {

  // Rail / area hash
  private HashMap<String, Float> _railByArea;

  // Maximum, minimum and average of railroads
  private int _minRailPerArea;
  private int _maxRailPerArea;
  private int _avgRailPerArea;

  // Main program
  private InteractiveMaps _mainProgram;



  //====================================================================================================================
  // Constructor
  //====================================================================================================================

  public RailwayMap (InteractiveMaps mainProgram, String railLengthFile, String areaFile) {
    _mainProgram = mainProgram;
    // Loading Rail and Area files
    HashMap<String, Float> railBundle = loadRailwaysFromCSV(railLengthFile);
    HashMap<String, Float> areaBundle = loadAreasFromCSV(areaFile);
    _railByArea = calculateRelativeRailLength (railBundle, areaBundle);
    shadeCountries (_mainProgram.countryRailwayMarkers ());
  }


  //====================================================================================================================
  // Getters
  //====================================================================================================================

  public int minimumRailPerArea () { return _minRailPerArea; }
  public int averageRailPerArea () { return _avgRailPerArea; }
  public int maximumRailPerArea () { return _maxRailPerArea; }



  //====================================================================================================================
  // Misc
  //====================================================================================================================

  /**
   * loadRailwaysFromCSV
   *
   * Receives a CSV with the data for the railways, parses it and returns it the data in a hashmap
   *
   * @param fileName - Name of the file to be parsed
   *
   * @return a HashMap <String, Float> with the parsed data (Country code | Railway (km))
   */
  private HashMap <String, Float> loadRailwaysFromCSV (String fileName) {
    HashMap<String, Float> railways = new HashMap<>();
    String[] rows = _mainProgram.loadStrings(fileName);
    for (String row : rows) {
      String[] columns = row.split(",");
      if (columns.length == 60 && columns[56].length () > 2 && columns[1].length () > 2) {
        try { // If the number cannot be parsed, do not insert into the hash
          railways.put(columns[1].substring (1, columns[1].length () -1),
            Float.parseFloat(columns[56].substring (1, columns[56].length () -1)));
        } catch (NumberFormatException e) {}
      }
    }
    return railways;
  }


  /**
   * loadAreasFromCSV
   *
   * Receives a CSV with the data for the areas, parses it and returns it the data in a hashmap
   *
   * @param fileName - Name of the file to be parsed
   *
   * @return a HashMap <String, Float> with the parsed data (Country code | Area (km2))
   */
  private HashMap <String, Float> loadAreasFromCSV(String fileName) {
    HashMap<String, Float> areas = new HashMap<>();
    String[] rows = _mainProgram.loadStrings(fileName);
    for (String row : rows) {
      String[] columns = row.split(",");
      if (columns.length == 60 && columns[58].length () > 2 && columns[1].length () > 2) {
        try { // If the number cannot be parsed, do not insert into the hash
          areas.put (columns[1].substring (1, columns[1].length () -1),
            Float.parseFloat(columns[58].substring (1, columns[58].length () -1)));
        } catch (NumberFormatException e) {}
      }
    }
    return areas;
  }


  /**
   * calculateRelativeRailLength
   *
   * This method receives two hashes: one with the rails and another with the areas, calculates the density of the
   * railroads for each country and returns a new hash with the density. It is also reponsible for calculating the
   * minimum, maximum and average range.
   *
   * @param railFile - Hash with the railroads for every country
   * @param areaFile - Hash with the area for every country
   * @return a new Hash with the density for every country (Country | Density (km2 of land per km of railroad))
   */
  private HashMap <String, Float> calculateRelativeRailLength (HashMap<String, Float> railFile, HashMap<String,
    Float> areaFile) {

    HashMap<String, Float> length = new HashMap <> ();
    float railAreaResult;
    _avgRailPerArea = 0;
    int numCountries = 0;

    for (Map.Entry<String, Float> rail : railFile.entrySet ()) {
      for (Map.Entry<String, Float> area : areaFile.entrySet ()) {
        if (rail.getKey ().equals (area.getKey ())) { // The countries match for the bundles

          // Calculating density and recording it
          railAreaResult = area.getValue () / rail.getValue ();
          length.put (rail.getKey (), railAreaResult);

          // Calculating ranges
          if (_minRailPerArea > (int) railAreaResult ) _minRailPerArea = (int) railAreaResult;
          if (_maxRailPerArea < (int) railAreaResult ) _maxRailPerArea = (int) railAreaResult;
          _avgRailPerArea += (int) railAreaResult;
          numCountries++;

          break;
        }
      }
    }

    _avgRailPerArea /= numCountries;

    return length;
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
      String countryId = marker.getId();
      if (_railByArea.containsKey(countryId)) {
        int colorLevel = (int) _mainProgram.map(_railByArea.get(countryId), 0,
          (_avgRailPerArea / 2) + _avgRailPerArea, 255, 10);
        marker.setColor(_mainProgram.color(255-colorLevel, 100, colorLevel));
      }
      else marker.setColor(_mainProgram.color(150,150,150));
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
    if (_mainProgram.lastSelected ()!= null) return;
    List<Marker> countryMarkers = _mainProgram.countryMarkers ();
    for (Marker country : countryMarkers) {
      MultiMarker countryMarker = new MultiMarker ();
      countryMarker.addMarkers (country);
      if (countryMarker.isInside (_mainProgram.map (), _mainProgram.mouseX, _mainProgram.mouseY)) {
        String title = country.getStringProperty ("name");
        if (_railByArea.containsKey (country.getId ())) {
          title += ": "+_railByArea.get (country.getId ())+"km2 of land per km of railroad";
        } else {
          title += ": No data.";
        }
        showTitle (_mainProgram.mouseX, _mainProgram.mouseY, title);
        break;
      }
    }
  }
}
