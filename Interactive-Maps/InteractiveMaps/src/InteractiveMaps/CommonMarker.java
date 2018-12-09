/**
 * CommonMarker
 *
 * Implements a common marker for cities and earthquakes on an earthquake map
 *
 * @author UC San Diego Intermediate Software Development MOOC team
 *         Henrique Salvadori Coelho
 *         Date: December 8, 2015
 */

package InteractiveMaps;

import de.fhpotsdam.unfolding.geo.Location;
import de.fhpotsdam.unfolding.marker.SimplePointMarker;
import processing.core.PGraphics;

public abstract class CommonMarker extends SimplePointMarker {

  // Records whether this marker has been clicked (most recently)
  protected boolean clicked = false;


  //====================================================================================================================
  // Constructors
  //====================================================================================================================

  public CommonMarker(Location location) {
    super(location);
  }
  
  public CommonMarker(Location location, java.util.HashMap<String,Object> properties) {
    super(location, properties);
  }



  //====================================================================================================================
  // Getters for private attributes
  //====================================================================================================================

  public boolean clicked () { return clicked; }



  //====================================================================================================================
  // Setters for private attributes
  //====================================================================================================================

  public void clicked (boolean state) { clicked = state; }



  //====================================================================================================================
  // Misc
  //====================================================================================================================

  /**
   * draw
   *
   * If the marker is not hidden, it is drawn on the GUI, and if it is selected, the title is shown
   *
   * @param pg - PGraphics to use for drawin the gui
   * @param x - Coordinate x for the mouse
   * @param y - Coordinate y for the mouse
   */
  public void draw(PGraphics pg, float x, float y) {
    if (!hidden) {
      drawMarker(pg, x, y);
      if (selected) {
        showTitle(pg, x, y);
      }
    }
  }


  /**
   * drawMarker
   *
   * Method to draw the marker on the gui
   *
   * @param pg - PGraphics to use for drawin the gui
   * @param x - Coordinate x for the mouse
   * @param y - Coordinate y for the mouse
   */
  public abstract void drawMarker (PGraphics pg, float x, float y);


  /**
   * showTitle
   *
   * Method to draw the marker title on the gui
   *
   * @param pg - PGraphics to use for drawin the gui
   * @param x - Coordinate x for the mouse
   * @param y - Coordinate y for the mouse
   */
  public abstract void showTitle (PGraphics pg, float x, float y);
}