/**
 * CityMarker
 *
 * Implements a visual marker for cities on an earthquake map
 *
 * @author UC San Diego Intermediate Software Development MOOC team
 *         Henrique Salvadori Coelho
 *         Date: December 8, 2015
 */

package InteractiveMaps;

import de.fhpotsdam.unfolding.data.Feature;
import de.fhpotsdam.unfolding.data.PointFeature;
import de.fhpotsdam.unfolding.geo.Location;
import processing.core.PConstants;
import processing.core.PGraphics;

public class CityMarker extends CommonMarker {

  // The size of the triangle marker
  public static final int triangleSize = 5;

  //====================================================================================================================
  // Constructors
  //====================================================================================================================

  public CityMarker (Location location) {
    super (location);
  }

  // Cities have properties: "name" (city name), "country" (country name) and "population" (population, in millions)
  public CityMarker(Feature city) {
    super (((PointFeature)city).getLocation(), city.getProperties());
  }



  //====================================================================================================================
  // Getters for private attributes
  //====================================================================================================================

  private String city       () { return getStringProperty ("name");    }
  private String country    () { return getStringProperty ("country"); }
  private float  population () { return Float.parseFloat (getStringProperty("population")); }



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
    // Save previous drawing style
    pg.pushStyle ();
    
    // Drawing the triangles for each city
    pg.fill (150, 30, 30);
    pg.triangle (x, y - triangleSize, x - triangleSize, y + triangleSize, x + triangleSize, y + triangleSize);
    
    // Restore previous drawing style
    pg.popStyle ();
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
    String name = city () + " " + country () + " ";
    String pop = "Pop: " + population () + " Million";
    
    pg.pushStyle ();
    
    pg.fill (255, 255, 255);
    pg.textSize (12);
    pg.rectMode (PConstants.CORNER);
    pg.rect (x, y - triangleSize - 39, Math.max(pg.textWidth(name), pg.textWidth(pop)) + 6, 39);
    pg.fill (0, 0, 0);
    pg.textAlign (PConstants.LEFT, PConstants.TOP);
    pg.text (name, x + 2, y - triangleSize - 33);
    pg.text (pop, x + 2, y - triangleSize - 18);
    
    pg.popStyle ();
  }

}
