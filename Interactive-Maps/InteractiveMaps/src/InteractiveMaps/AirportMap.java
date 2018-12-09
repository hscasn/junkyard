/**
 * AirportMarker
 *
 * An applet that shows airports (and routes) on a world map.
 *
 * @author Adam Setters and the UC San Diego Intermediate Software Development
 *         MOOC team
 *         Henrique Salvadori Coelho
 *         Date: December 8, 2015
 */

package InteractiveMaps;

import de.fhpotsdam.unfolding.data.PointFeature;
import de.fhpotsdam.unfolding.data.ShapeFeature;
import de.fhpotsdam.unfolding.geo.Location;
import de.fhpotsdam.unfolding.marker.Marker;
import de.fhpotsdam.unfolding.marker.SimpleLinesMarker;
import processing.core.PApplet;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

public class AirportMap extends PApplet {

  // Main program
  private InteractiveMaps _mainProgram;

  // Data set
  private List <PointFeature> _features;
  private List <ShapeFeature> _routes;
  private HashMap <Integer, Location> _airports;

  // An array with all the routes that are being shown. Using this array will avoid having to loop through all the
  // routes to show/hide them
  private ArrayList <SimpleLinesMarker> _routesShowing;


  //====================================================================================================================
  // Constructor
  //====================================================================================================================

	public AirportMap (InteractiveMaps mainProgram, String airportFile, String routeFile) {
    _mainProgram = mainProgram;

    _routesShowing = new ArrayList <> ();

    // Parses the data in a set of feature
		_features = ParseFeed.parseAirports (_mainProgram, airportFile);
    _routes   = ParseFeed.parseRoutes   (_mainProgram, routeFile);
		
		// List for markers, hashmap for quicker access when matching with routes
		_mainProgram.airportList (new ArrayList <> ());
    _mainProgram.routeList   (new ArrayList <> ());
    _airports = new HashMap <> ();
		
		// Create markers from features for airports
		for (PointFeature feature : _features) {
			AirportMarker marker = new AirportMarker (feature);
			marker.setRadius(5);
      marker.setId (feature.getId ());

      // Adding the airport to the list
			_mainProgram.airportList ().add(marker);
			
			// Put airport in hashmap with OpenFlights unique id for key
      _airports.put (Integer.parseInt (feature.getId ()), feature.getLocation ());
		}


    int source;
    int dest;
		for(ShapeFeature route : _routes) {

			// Gets source and destination for the airports
			source = Integer.parseInt ((String) route.getProperty ("source"));
			dest   = Integer.parseInt ((String) route.getProperty ("destination"));

			// Getting the locations for airports on route
			if (_airports.containsKey (source) && _airports.containsKey (dest)) {
				route.addLocation (_airports.get (source));
				route.addLocation (_airports.get (dest));
			}

      SimpleLinesMarker newRoute = new SimpleLinesMarker (route.getLocations (), route.getProperties ());
      newRoute.setColor (11);
      newRoute.setHidden (true);

      // Adding the marker to the list
      _mainProgram.routeList ().add (newRoute);
		}
	}



  //====================================================================================================================
  // Misc
  //====================================================================================================================

  /**
   * routesShowing
   *
   * Used to recover what routes are being shown in the map
   *
   * @return a list with all the routes
   */
  public ArrayList <SimpleLinesMarker> routesShowing () {
    return _routesShowing;
  }


  /**
   * checkForClick
   *
   * Checks if the user clicked on an airport; if he did, shows all the available routes to and from this airport
   */
  public void checkForClick () {
    if (_mainProgram.lastClicked () == null) {
      SimpleLinesMarker route;

      // Hiding all the markers that are being shown
      for (SimpleLinesMarker routeShowing : _routesShowing) {
        routeShowing.setHidden (true);
      }
      _routesShowing.clear ();

      // Loop over the markers to see if one of them is selected
      List <Marker> airportList = _mainProgram.airportList ();
      List <Marker> routeList = _mainProgram.routeList ();
      for (Marker marker : airportList) {
        if (marker.isInside (_mainProgram.map (), _mainProgram.mouseX, _mainProgram.mouseY)) {
          _mainProgram.lastClicked ((CommonMarker) marker);

          for (Marker r : routeList) {
            route = (SimpleLinesMarker) r;
            if (route.getStringProperty ("source").equals (marker.getId ()) ||
              route.getStringProperty ("destination").equals (marker.getId ())) {
              route.setHidden (false);
              _routesShowing.add (route);
            }
          }

          break;
        }
      }
    }
  }
}
