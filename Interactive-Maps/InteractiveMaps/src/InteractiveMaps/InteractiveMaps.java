/**
 * EarthquakeCityMap
 * An application with an interactive map displaying earthquake data.
 *
 * Author: UC San Diego Intermediate Software Development MOOC team
 * @author Henrique Salvadori Coelho
 *         Date: December 8, 2015
 */

package InteractiveMaps;

import de.fhpotsdam.unfolding.UnfoldingMap;
import de.fhpotsdam.unfolding.data.Feature;
import de.fhpotsdam.unfolding.data.GeoJSONReader;
import de.fhpotsdam.unfolding.marker.Marker;
import de.fhpotsdam.unfolding.providers.Google;
import de.fhpotsdam.unfolding.utils.MapUtils;
import processing.core.PApplet;
import processing.core.PImage;
import java.util.List;

public class InteractiveMaps extends PApplet {

  // The files containing the info
  private final String earthquakesURL     = "http://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.atom";
  private final String lifeExpectancyFile = "LifeExpectancyWorldBank.csv";
  private final String cityFile           = "city-data.json";
  private final String countryFile        = "countries.geo.json";
  private final String railFile           = "raillength.csv";
  private final String areaFile           = "area.csv";
  private final String airportFile        = "airports.dat";
  private final String routeFile          = "routes.dat";

  // The map
  private UnfoldingMap map;

  // A List features and markers
  private List <Feature> countries;
  private List <Marker> countryMarkers;
  private List <Marker> countryRailwayMarkers;
  private List <Marker> countryLifeExpectancyMarkers;
  private List <Marker> cityMarkers;
  private List <Marker> quakeMarkers;
  private List <Marker> airportList;
  private List <Marker> routeList;

  // The overlays for the map
  private RailwayMap railwayMap;
  private QuakeMap quakeMap;
  private LifeExpectancyMap lifeExpectancyMap;
  private AirportMap airportMap;

  // Controls to show/hide the overlays
  private boolean showKey;
  private boolean showRail;
  private boolean showQuake;
  private boolean showLifeExpectancy;
  private boolean showAirport;
  private boolean quakesMapIsHidden;
  private boolean railwayMapIsHidden;
  private boolean lifeExpectancyMapIsHidden;
  private boolean airportMapIsHidden;

  // The gradient image for the key overlay
  PImage gradientKey;

  // Controls for mouse hover/click
  private CommonMarker lastSelected;
  private CommonMarker lastClicked;


  //====================================================================================================================
  // Setup and Draw
  //====================================================================================================================

  /**
   * setup
   */
  public void setup () {
    size (900, 700, OPENGL);

    // Starting all overlays
    showKey = true;
    showRail = true;
    showQuake = true;
    showLifeExpectancy = false;
    showAirport = false;
    quakesMapIsHidden = false;
    railwayMapIsHidden = false;
    lifeExpectancyMapIsHidden = false;
    airportMapIsHidden = false;

    // Setting the gradient image for the key
    gradientKey = loadImage ("gradient.jpg", "jpg");

    // Starting the map
    map = new UnfoldingMap (this, 0, 0, width, height, new Google.GoogleMapProvider ());
    MapUtils.createDefaultEventDispatcher (this, map);

    // Load country polygons and adds them as markers
    countries = GeoJSONReader.loadData (this, countryFile);
    countryMarkers = MapUtils.createSimpleMarkers (countries);
    countryRailwayMarkers = MapUtils.createSimpleMarkers (countries);
    countryLifeExpectancyMarkers = MapUtils.createSimpleMarkers (countries);

    // Starting the overlays
    railwayMap  = new RailwayMap (this, railFile, areaFile);
    quakeMap    = new QuakeMap   (this, cityFile, earthquakesURL);
    airportMap  = new AirportMap (this, airportFile, routeFile);
    lifeExpectancyMap = new LifeExpectancyMap (this, lifeExpectancyFile);

    // Adding the markers in the map
    map.addMarkers (countryRailwayMarkers);
    map.addMarkers (countryLifeExpectancyMarkers);
    map.addMarkers (quakeMarkers);
    map.addMarkers (cityMarkers);
    map.addMarkers (airportList);
    map.addMarkers (routeList);
  }


  /**
   * draw
   */
  public void draw () {
    // Drawing the background and the map
    background (255, 255, 255);
    map.draw ();

    // Adding the buttons
    addButtons ();

    // Adding the keys, if  supposed to be shown
    if (showKey) addKey ();

    // If the program must hide the quakes but they are being shown, hides them;
    // If the program must show quakes but they are hidden, shows them
    if (!showQuake && !quakesMapIsHidden) {
      hideQuakeMarkers ();
    } else if (showQuake && quakesMapIsHidden) {
      unhideQuakeMarkers ();
    }

    // If the program must hide the rail networks but they are being shown, hides them;
    // If the program must show rail networks but they are hidden, shows them
    if (!showRail && !railwayMapIsHidden) {
      hideRailwayMarkers ();
    } else if (showRail && railwayMapIsHidden) {
      unhideRailwayMarkers ();
    }

    // If the program must hide the life expectancy but they are being shown, hides them;
    // If the program must show life expectancy but they are hidden, shows them
    if (!showLifeExpectancy && !lifeExpectancyMapIsHidden) {
      hideLifeExpectancyMarkers ();
    } else if (showLifeExpectancy && lifeExpectancyMapIsHidden) {
      unhideLifeExpectancyMarkers ();
    }


    // If the program must hide the airports and routes but they are being shown, hides them;
    // If the program must show airports and routes but they are hidden, shows them
    if (!showAirport && !airportMapIsHidden) {
      hideAirportMarkers ();
    } else if (showAirport && airportMapIsHidden) {
      unhideAirportMarkers ();
    }

    // Showing the railway data for mouse hover, if the rails are supposed to be shown
    if (showRail) railwayMap.displayCountryData ();
    else if (showLifeExpectancy) lifeExpectancyMap.displayCountryData ();
  }



  //====================================================================================================================
  // Getters for private attributes
  //====================================================================================================================

  public    UnfoldingMap  map            () { return map;            }
  protected CommonMarker  lastClicked    () { return lastClicked;    }
  protected CommonMarker  lastSelected   () { return lastSelected;   }
  protected List <Marker> cityMarkers    () { return cityMarkers;    }
  protected List <Marker> quakeMarkers   () { return quakeMarkers;   }
  protected List <Marker> countryMarkers () { return countryMarkers; }
  protected List <Marker> airportList    () { return airportList;    }
  protected List <Marker> routeList      () { return routeList;      }
  protected List <Marker> countryRailwayMarkers        () { return countryRailwayMarkers;        }
  protected List <Marker> countryLifeExpectancyMarkers () { return countryLifeExpectancyMarkers; }



  //====================================================================================================================
  // Setters for private attributes
  //====================================================================================================================

  protected void lastClicked    (CommonMarker click   ) { lastClicked    = click;   }
  protected void cityMarkers    (List <Marker> markers) { cityMarkers    = markers; }
  protected void quakeMarkers   (List <Marker> markers) { quakeMarkers   = markers; }
  protected void airportList    (List <Marker> markers) { airportList    = markers; }
  protected void routeList      (List <Marker> markers) { routeList      = markers; }



  //====================================================================================================================
  // Event Handlers
  //====================================================================================================================

  /**
   * mouseMoved
   *
   * Event handler that gets called automatically when the mouse moves.
   */
  @Override
  public void mouseMoved () {

    // Clears the last selection
    if (lastSelected != null) {
      lastSelected.setSelected (false);
      lastSelected = null;
    }

    // If a marker is being hovered, selects it
    if (showQuake)   selectMarkerIfHover (quakeMarkers);
    if (showQuake)   selectMarkerIfHover (cityMarkers);
    if (showAirport) selectMarkerIfHover (airportList);
  }


  /**
   * mouseClicked
   *
   * The event handler for mouse clicks
   * It will display an earthquake and its threat circle of cities or if a city is clicked, it will display all the
   * earthquakes where the city is in the threat circle
   */
  @Override
  public void mouseClicked () {

    // Checks if the user clicked on a button
    int button = clickedButton ();

    // If a button was clicked...
    if (button > -1) {

      // Uses a switch to verify which button was clicked and toggles the options
      switch (button) {
        case 0: showKey   = !showKey;   break;
        case 1:
          showRail  = !showRail;

          // If the rail is set to show, hides the other country overlays
          if (showRail) showLifeExpectancy = false;
          break;
        case 2: showQuake = !showQuake; break;
        case 3:
          showLifeExpectancy = !showLifeExpectancy;

          // If the life expectancy is set to show, hides the other country overlays
          if (showLifeExpectancy) showRail = false;
          break;
         case 4: showAirport = !showAirport; break;
      }

      // If no button was clicked...
    } else {
      if (lastClicked != null) lastClicked = null;

      // Check for clicks in the overlay maps
      quakeMap.checkForClick ();
      airportMap.checkForClick ();

      // If the click was not in a marker, unhides all the quake markers
      if (lastClicked == null) {
        unhideQuakeMarkers ();
      }
    }
  }



  //====================================================================================================================
  // Buttons, keys and controls
  //====================================================================================================================

  /**
   * addButtons
   *
   * Displays the buttons on the gui
   */
  private void addButtons () {
    int xbase = 25;
    int ybase = 25;

    strokeWeight (1);
    if (showKey) fill (255, 255, 255, 255);
    else fill (255, 255, 255, 140);
    rect (xbase, ybase, 150, 20);

    if (showRail) fill (255, 255, 255, 255);
    else fill (255, 255, 255, 140);
    rect (xbase, ybase + 25, 150, 20);

    if (showQuake) fill (255, 255, 255, 255);
    else fill (255, 255, 255, 140);
    rect (xbase, ybase + 50, 150, 20);

    if (showLifeExpectancy) fill (255, 255, 255, 255);
    else fill (255, 255, 255, 140);
    rect (xbase, ybase + 75, 150, 20);

    if (showAirport) fill (255, 255, 255, 255);
    else fill (255, 255, 255, 140);
    rect (xbase, ybase + 100, 150, 20);

    fill (0);
    textAlign (LEFT, CENTER);
    text ("Toggle Keys", xbase + 5, ybase + 8);
    text ("Toggle Railroad density", xbase + 5, ybase + 33);
    text ("Toggle Cities/Quakes", xbase + 5, ybase + 58);
    text ("Toggle Life Expectancy", xbase + 5, ybase + 83);
    text ("Toggle Airports", xbase + 5, ybase + 108);
  }


  /**
   * addKey
   *
   * Displays the key on the gui
   */
  private void addKey () {
    fill (255, 250, 240);

    int xbase = 25;
    int ybase = 150;

    strokeWeight (0);
    fill (255, 255, 255, 180);
    rect (xbase, ybase, 200, 360);

    strokeWeight (1);
    fill (0);
    textAlign (LEFT, CENTER);
    textSize (12);

    fill (150, 30, 30);
    int tri_xbase = xbase + 35;
    int tri_ybase = ybase + 25;
    triangle (tri_xbase, tri_ybase - CityMarker.triangleSize, tri_xbase - CityMarker.triangleSize,
      tri_ybase + CityMarker.triangleSize, tri_xbase + CityMarker.triangleSize,
      tri_ybase + CityMarker.triangleSize);

    fill (0, 0, 0);
    textAlign (LEFT, CENTER);
    text ("City", tri_xbase + 15, tri_ybase);
    text ("Airport", xbase + 50, ybase + 50);

    // Airport ellipse
    strokeWeight (0);
    fill (0, 0, 255);
    ellipse (tri_xbase, tri_ybase + 25, 5, 5);
    strokeWeight (1);
    fill (0);

    text ("Earthquake Key", xbase + 25, ybase + 85);
    text ("Land Quake", xbase + 50, ybase + 110);
    text ("Ocean Quake", xbase + 50, ybase + 130);
    text ("Size ~ Magnitude", xbase + 25, ybase + 150);

    fill (255, 255, 255);
    ellipse (xbase + 35, ybase + 110, 10, 10);
    rect (xbase + 35 - 5, ybase + 130 - 5, 10, 10);

    fill (color (255, 255, 0));
    ellipse (xbase + 35, ybase + 170, 12, 12);
    fill (color (0, 0, 255));
    ellipse (xbase + 35, ybase + 190, 12, 12);
    fill (color (255, 0, 0));
    ellipse (xbase + 35, ybase + 210, 12, 12);

    textAlign (LEFT, CENTER);
    fill (0, 0, 0);
    text ("Shallow", xbase + 50, ybase + 170);
    text ("Intermediate", xbase + 50, ybase + 190);
    text ("Deep", xbase + 50, ybase + 210);
    text ("Past hour", xbase + 50, ybase + 230);

    fill (255, 255, 255);
    int centerx = xbase + 35;
    int centery = ybase + 230;
    ellipse (centerx, centery, 12, 12);

    strokeWeight (2);
    line (centerx - 8, centery - 8, centerx + 8, centery + 8);
    line (centerx - 8, centery + 8, centerx + 8, centery - 8);

    image (gradientKey, xbase + 25, ybase + 285);

    textAlign (LEFT, CENTER);
    fill (0, 0, 0);
    text ("Railroad density", xbase + 25, ybase + 250);
    text ("(km2 of area per km of rail)", xbase + 25, ybase + 270);
    text ("High (< " + railwayMap.averageRailPerArea () + "km)", xbase + 50, ybase + 290);
    text ("Average (" + railwayMap.averageRailPerArea () + "km)", xbase + 50, ybase + 310);
    text ("Low (> " + railwayMap.averageRailPerArea () + "km)", xbase + 50, ybase + 330);

  }



  //====================================================================================================================
  // Misc
  //====================================================================================================================

  /**
   * clickedButton
   *
   * Verifies, based on the position of the mouse, if the user is hovering a button or not.
   * @return an integer with the index of the button being hovered (0+). If no button is being hovered, returns -1
   */
  private int clickedButton () {
    if (mouseX >= 25 && mouseX <= 157 && mouseY >= 25 && mouseY <= 45) {
      return 0;
    } else if (mouseX >= 25 && mouseX <= 157 && mouseY >= 50 && mouseY <= 70) {
      return 1;
    } else if (mouseX >= 25 && mouseX <= 157 && mouseY >= 75 && mouseY <= 95) {
      return 2;
    } else if (mouseX >= 25 && mouseX <= 157 && mouseY >= 100 && mouseY <= 120) {
      return 3;
    } else if (mouseX >= 25 && mouseX <= 157 && mouseY >= 125 && mouseY <= 145) {
      return 4;
    } else {
      return -1;
    }
  }


  /**
   * selectMarkerIfHover
   *
   * Checks if any marker is being hovered by the mouse, if there is, selects it
   *
   * @param markers - List of markers to verify if they are being hovered
   */
  private void selectMarkerIfHover (List<Marker> markers) {
    // Aborts if there is already a marker selected or the bundle is empty
    if (lastSelected == null && markers != null) {
      for (Marker m : markers) {
        CommonMarker marker = (CommonMarker) m;

        // If the mouse is hovering a marker, sets it as selected; sets it as the last selected marker
        // and aborts the loop
        if (marker.isInside (map, mouseX, mouseY)) {
          lastSelected = marker;
          marker.setSelected (true);
          break;
        }
      }
    }
  }


  /**
   * unhideQuakeMarkers
   *
   * Unhides all the markers for the quakes overlay in the map
   */
  private void unhideQuakeMarkers () {
    for (Marker marker : quakeMarkers) marker.setHidden (false);
    for (Marker marker : cityMarkers ) marker.setHidden (false);
    quakesMapIsHidden = false;
  }


  /**
   * hideQuakeMarkers
   *
   * Hides all the markers for the quakes overlay in the map
   */
  private void hideQuakeMarkers () {
    for (Marker marker : quakeMarkers) marker.setHidden (true);
    for (Marker marker : cityMarkers ) marker.setHidden (true);
    quakesMapIsHidden = true;
  }


  /**
   * unhideRailwayMarkers
   *
   * Unhides all the markers for the railways overlay in the map
   */
  private void unhideRailwayMarkers () {
    for (Marker marker : countryRailwayMarkers) marker.setHidden (false);
    railwayMapIsHidden = false;
  }


  /**
   * hideRailwayMarkers
   *
   * Hides all the markers for the railways overlay in the map
   */
  private void hideRailwayMarkers () {
    for (Marker marker : countryRailwayMarkers) marker.setHidden (true);
    railwayMapIsHidden = true;
  }


  /**
   * unhideLifeExpectancyMarkers
   *
   * Unhides all the markers for the railways overlay in the map
   */
  private void unhideLifeExpectancyMarkers () {
    for (Marker marker : countryLifeExpectancyMarkers) marker.setHidden (false);
    lifeExpectancyMapIsHidden = false;
  }


  /**
   * hideLifeExpectancyMarkers
   *
   * Hides all the markers for the railways overlay in the map
   */
  private void hideLifeExpectancyMarkers () {
    for (Marker marker : countryLifeExpectancyMarkers) marker.setHidden (true);
    lifeExpectancyMapIsHidden = true;
  }


  /**
   * unhideAirportMarkers
   *
   * Unhides all the markers for the railway and routes overlay in the map - This function does not affect routes
   */
  private void unhideAirportMarkers () {
    for (Marker marker : airportList) marker.setHidden (false);
    airportMapIsHidden = false;
  }


  /**
   * hideAirportMarkers
   *
   * Hides all the markers for the railway and routes overlay in the map
   */
  private void hideAirportMarkers () {
    for (Marker marker : airportList) marker.setHidden (true);
    for (Marker marker : airportMap.routesShowing ()) marker.setHidden (true);
    airportMap.routesShowing ().clear ();
    airportMapIsHidden = true;
  }
}
