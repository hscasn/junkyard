/**
 * EarthquakeMarker
 *
 * Implements a visual marker for earthquakes on an earthquake map
 *
 * @author UC San Diego Intermediate Software Development MOOC team
 *         Henrique Salvadori Coelho
 *         Date: December 8, 2015
 */

package InteractiveMaps;

import de.fhpotsdam.unfolding.data.PointFeature;
import processing.core.PConstants;
import processing.core.PGraphics;

public abstract class EarthquakeMarker extends CommonMarker implements Comparable <EarthquakeMarker>
{
  
  // Did the earthquake occur on land?  This will be set by the subclasses.
  protected boolean isOnLand;

  // The radius of the Earthquake marker
  protected float radius;
  
  // Constants for distance
  protected static final float kmPerMile = 1.6f;
  
  // Greater than or equal to this threshold is a moderate earthquake
  public static final float THRESHOLD_MODERATE = 5;
  // Greater than or equal to this threshold is a light earthquake
  public static final float THRESHOLD_LIGHT = 4;

  // Greater than or equal to this threshold is an intermediate depth
  public static final float THRESHOLD_INTERMEDIATE = 70;
  // Greater than or equal to this threshold is a deep depth
  public static final float THRESHOLD_DEEP = 300;


  //====================================================================================================================
  // Constructors
  //====================================================================================================================

  public EarthquakeMarker (PointFeature feature) {
    super (feature.getLocation ());

    // Add a radius property and then set the properties
    java.util.HashMap <String, Object> properties = feature.getProperties ();

    float magnitude = Float.parseFloat (properties.get ("magnitude").toString ());
    properties.put ("radius", 2 * magnitude);
    setProperties (properties);
    this.radius = 1.75f * magnitude ();
  }



  //====================================================================================================================
  // Getters for private attributes
  //====================================================================================================================

  public float   magnitude () { return Float.parseFloat (getProperty ("magnitude").toString ()); }
  public float   depth     () { return Float.parseFloat (getProperty ("depth").toString ());     }
  public String  title     () { return (String) getProperty ("title");                           }
  public float   radius    () { return Float.parseFloat (getProperty ("radius").toString ());    }
  public boolean isOnLand  () { return isOnLand; }


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
  @Override
  public void drawMarker(PGraphics pg, float x, float y) {
    // Save previous styling
    pg.pushStyle ();
      
    // Determine color of marker from depth
    colorDetermine (pg);
    
    // Call abstract method implemented in child class to draw marker shape
    drawEarthquake (pg, x, y);
    
    // Adds X over marker if within past day
    String age = getStringProperty ("age");
    if ("Past Hour".equals (age) || "Past Day".equals (age)) {
      
      pg.strokeWeight (2);
      int buffer = 2;
      pg.line (x - (radius+buffer),
          y - (radius+buffer),
          x + radius+buffer,
          y + radius+buffer);
      pg.line (x - (radius + buffer),
          y + (radius + buffer),
          x + radius + buffer,
          y - (radius + buffer));
      
    }
    
    // Reset to previous styling
    pg.popStyle ();
    
  }


  /**
   * compareTo
   *
   * Used to compare two earthquakes, returns a negative number if this earthquake has a larger magnitude; 0 if they
   * have the same magnitude or a positive number if the earthquake received has a greater magnitude
   *
   * @param marker - The marker with the earthquake to compare
   *
   * @return an integer with the result of the comparison
   */
  public int compareTo (EarthquakeMarker marker) {
    return (int) ((marker.magnitude () - this.magnitude ()) * 100);
  }



  //====================================================================================================================
  // Misc
  //====================================================================================================================

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
    String title = title ();
    pg.pushStyle ();
    
    pg.rectMode (PConstants.CORNER);
    
    pg.stroke (110);
    pg.fill (255, 255, 255);
    pg.rect (x, y + 16, pg.textWidth (title) + 6, 18, 5);
    
    pg.textAlign (PConstants.LEFT, PConstants.TOP);
    pg.fill (0);
    pg.text (title, x + 3 , y +18);
    
    
    pg.popStyle ();
  }

  
  /**
   * threatCircle
   *
   * Calculates the threat circle radius, distance up to which this earthquake can affect things, for this earthquake
   *
   * @return the "threat circle" radius
   *
   * DISCLAIMER: this formula is for illustration purposes only and is not intended to be used for safety-critical
   * or predictive applications.
   */
  public double threatCircle() {  
    double miles = 20.0f * Math.pow (1.8, 2 * magnitude () - 5);
    double km = (miles * kmPerMile);
    return km;
  }


  /**
   * colorDetermine
   *
   * Determines the colour of the marker from depth:
   * - Deep: red; intermediate: blue; shallow: yellow
   *
   * @param pg - The PGraphics which will be used to set the fill
   */
  private void colorDetermine(PGraphics pg) {
    float depth = depth ();
    
    if (depth < THRESHOLD_INTERMEDIATE) {
      pg.fill (255, 255, 0);
    } else if (depth < THRESHOLD_DEEP) {
      pg.fill (0, 0, 255);
    } else {
      pg.fill (255, 0, 0);
    }
  }
  
  
  /**
   * toString
   *
   * Returns an earthquake marker's string representation
   *
   * @return the string representation of an earthquake marker.
   */
  public String toString()
  {
    return title();
  }


  /**
   * drawEarthquake
   *
   * Draws the icon of the earthquake in the map
   *
   * @param pg - PGraphics to use for drawin the gui
   * @param x - Coordinate x for the mouse
   * @param y - Coordinate y for the mouse
   */
  public abstract void drawEarthquake (PGraphics pg, float x, float y);
  
}
