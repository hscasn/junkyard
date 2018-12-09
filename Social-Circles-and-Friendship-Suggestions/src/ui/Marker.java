package ui;

import java.awt.*;

/**
 * Marker
 *
 * Represents a vertex in the graph
 *
 * @author Henrique Salvadori Coelho - hcoelho.com - henriquesc@gmail.com
 */

public class Marker {
  private int value = 0;
  private GraphCanvas gc;
  private boolean isVisible;
  private int emphasis;
  private boolean isSelected;

  /**
   * Builds the marker
   *
   * @param value Key (value) of the marker
   * @param gc Graph canvas for the marker to be drawn on
   */
  public Marker(int value, GraphCanvas gc) {
    this.gc = gc;
    this.value = value;
    this.isVisible = true;
    this.emphasis = 0;
  }

  /**
   * @return The key (value) of the marker
   */
  public int getValue() {
    return value;
  }

  /**
   * Makes the marker visible
   */
  public void show() {
    isVisible = true;
  }

  /**
   * Hides the marker
   */
  public void hide() {
    isVisible = false;
  }

  /**
   * Makes the marker selected
   */
  public void select() {
    isSelected = true;
  }

  /**
   * Deselect the marker
   */
  public void deselect() {
    isSelected = false;
  }

  /**
   * Makes the marker emphasized
   */
  public void emphasize(int e) {
    if      (e < 1) { e = 1; }
    else if (e > 5) { e = 5; }
    emphasis = e;
  }

  /**
   * @return The emphasis of the marker
   */
  public int getEmphasis() {
    return emphasis;
  }

  /**
   * De-emphasizes the marker
   */
  public void deemphasize() {
    emphasis = 0;
  }

  /**
   * Draws the marker in the graph canvas
   */
  public void draw() {
    if (!isVisible) { return; }
    int[] pos = getCoordinates();

    gc.pushMatrix();
    gc.noStroke();
    if      (isSelected  ) { gc.fill(new Color(194, 189, 32).getRGB()); }
    else if (emphasis > 0) { gc.fill(new Color(200 / emphasis, 17 / emphasis, 127 / emphasis).getRGB()); }
    else                   { gc.fill(new Color(35, 106, 150).getRGB()); }
    gc.ellipse(pos[0], pos[1], gc.markWidth, gc.markWidth);
    gc.popMatrix();
  }

  /**
   * @return The position [x, y] of this marker on the canvas
   */
  public int[] getCoordinates() {
    int i = value % gc.marksInWidth;
    int j = value / gc.marksInHeight;

    return new int[] {
      (gc.markWidth + (gc.markWidth / 2)) + (i * gc.markWidth * gc.markMargin) + gc.topMargin,
      (gc.markWidth + (gc.markWidth / 2)) + (j * gc.markWidth * gc.markMargin) + gc.topMargin
    };
  }

  /**
   * Draws a popup for this marker with its value, if the marker is being hovered
   *
   * @param mouseX Coordinate X of the mouse
   * @param mouseY Coordinate Y of the mouse
   */
  public void popupIfSelected(int mouseX, int mouseY) {
    if (!isVisible || !isSelected(mouseX, mouseY)) { return; }

    int[] pos = getCoordinates();

    gc.pushMatrix();

    gc.fill(new Color(244, 239, 175).getRGB());
    gc.stroke(new Color(244, 201, 121).getRGB());
    gc.rect(pos[0] - 5, pos[1] - 30, gc.textWidth(String.valueOf(value)) + 10, 30);

    gc.noStroke();
    gc.fill(Color.BLACK.getRGB());
    gc.textSize(13);
    gc.text(value, pos[0], pos[1] - 10);

    gc.popMatrix();
  }

  /**
   * Verifies if the user is pointing to this element
   *
   * @param mouseX Coordinate X of the mouse
   * @param mouseY Coordinate Y of the mouse
   * @return True if the user is pointing to this element, false otherwise
   */
  public boolean isSelected(int mouseX, int mouseY) {
    int[] pos = getCoordinates();
    int halfWidth = gc.markWidth / 2;

    return mouseX <= pos[0] + halfWidth && mouseX >= pos[0] - halfWidth &&
           mouseY <= pos[1] + halfWidth && mouseY >= pos[1] - halfWidth;
  }

  /**
   * Compares this marker with another
   *
   * @param that Marker to be compared with this
   * @return True if the markers are identical, false otherwise
   */
  @Override
  public boolean equals(Object that) {
    return (that instanceof Marker) && (this.value == ((Marker) that).getValue());
  }
}
