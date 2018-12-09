/**
 * LandQuakeMarker
 *
 * Implements a visual marker for land earthquakes on an earthquake map
 *
 * @author UC San Diego Intermediate Software Development MOOC team
 *         Henrique Salvadori Coelho
 *         Date: December 8, 2015
 */

package InteractiveMaps;

import de.fhpotsdam.unfolding.data.PointFeature;
import processing.core.PGraphics;

public class LandQuakeMarker extends EarthquakeMarker {

  //====================================================================================================================
  // Constructors
  //====================================================================================================================

  public LandQuakeMarker (PointFeature quake) {
    super(quake);
    
    // Setting field in earthquake marker
    isOnLand = true;
  }



  //====================================================================================================================
  // Getters
  //====================================================================================================================

  public String country () { return (String) getProperty ("country"); }



  //====================================================================================================================
  // Interface implementation
  //====================================================================================================================

  /**
   * drawEarthquake
   *
   * Draws the icon of the earthquake in the map
   *
   * @param pg - PGraphics to use for drawin the gui
   * @param x - Coordinate x for the mouse
   * @param y - Coordinate y for the mouse
   */
  @Override
  public void drawEarthquake(PGraphics pg, float x, float y) {
    // IMPLEMENT: drawing circle for LandQuake
    // DO NOT set the fill color.  That will be set in the EarthquakeMarker
    // class to indicate the depth of the earthquake.
    // Simply draw a centered square.
    // HINT: Notice the radius variable in the EarthquakeMarker class
    // and how it is set in the EarthquakeMarker constructor
    pg.ellipse (x, y, 2 * radius, 2 * radius);
    
  }

}