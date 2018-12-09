/**
 * AirportMarker
 *
 * A class to represent AirportMarkers on a world map.
 *
 * @author UC San Diego Intermediate Software Development MOOC team
 *         Henrique Salvadori Coelho
 *         Date: December 8, 2015
 */

package InteractiveMaps;

import de.fhpotsdam.unfolding.data.Feature;
import de.fhpotsdam.unfolding.data.PointFeature;
import de.fhpotsdam.unfolding.marker.SimpleLinesMarker;
import processing.core.PConstants;
import processing.core.PGraphics;
import java.util.List;

public class AirportMarker extends CommonMarker {

  // Routes for each airport
  private static List <SimpleLinesMarker> routes;

  //====================================================================================================================
  // Constructors
  //====================================================================================================================

  public AirportMarker (Feature city) {
    super (((PointFeature)city).getLocation (), city.getProperties ());
  }



  //====================================================================================================================
  // Getters for private attributes
  //====================================================================================================================

  private List <SimpleLinesMarker> routes () { return routes; }



  //====================================================================================================================
  // Interface implementation
  //====================================================================================================================

  /**
   * drawMarker
   *
   * Method to draw the marker on the gui
   *
   * @param pg - PGraphics to use for drawin the gui
   * @param x - Coordinate x for the mouse
   * @param y - Coordinate y for the mouse
   */
  public void drawMarker(PGraphics pg, float x, float y) {
    pg.strokeWeight (0);
    pg.fill (0, 0, 255);
    pg.ellipse (x, y, 5, 5);
    pg.strokeWeight (1);
  }


  /**
   * showTitle
   *
   * Method to draw the marker title on the gui
   *
   * @param pg - PGraphics to use for drawin the gui
   * @param x - Coordinate x for the mouse
   * @param y - Coordinate y for the mouse
   */
  public void showTitle (PGraphics pg, float x, float y)
  {
    String name = "";
    if (getStringProperty ("code").length () > 0) {
      name += "("+getStringProperty ("code")+") ";
    }
    name += getStringProperty ("name")+" airport";

    String extra = getStringProperty ("city")+"/"+getStringProperty ("country")+". Altitude: "
                   +getStringProperty ("altitude")+"m.";
    
    pg.pushStyle ();
    
    pg.fill (255, 255, 255);
    pg.textSize (12);
    pg.rectMode (PConstants.CORNER);
    pg.rect (x, y-39, Math.max(pg.textWidth(name), pg.textWidth(extra)) + 6, 39);
    pg.fill (0, 0, 0);
    pg.textAlign (PConstants.LEFT, PConstants.TOP);
    pg.text (name, x + 2, y - 33);
    pg.text (extra, x + 2, y - 18);
    
    pg.popStyle ();
  }

}