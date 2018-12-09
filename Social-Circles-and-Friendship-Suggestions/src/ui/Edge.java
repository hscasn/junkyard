package ui;

import java.awt.*;

/**
 * Edge
 *
 * Represents a connection between two markers
 *
 * @author Henrique Salvadori Coelho - hcoelho.com - henriquesc@gmail.com
 */

public class Edge {
  private Marker m1;
  private Marker m2;
  private GraphCanvas gc;
  private boolean isVisible;

  /**
   * Builds an edge
   *
   * @param m1 Starting node
   * @param m2 End node
   * @param gc Graph Canvas to draw the edge
   * @param visible State of the object: true for visible, false for not visible
   */
  public Edge(Marker m1, Marker m2, GraphCanvas gc, boolean visible) {
    this.isVisible = visible;
    this.gc = gc;
    this.m1 = m1;
    this.m2 = m2;
  }

  /**
   * Sets the object as visible
   */
  public void show() {
    isVisible = true;
  }

  /**
   * Sets the object as hidden
   */
  public void hide() {
    isVisible = false;
  }

  /**
   * Draws the edge on the graph canvas
   */
  public void draw() {
    if (!isVisible) { return; }

    int[] pos1 = m1.getCoordinates();
    int[] pos2 = m2.getCoordinates();

    gc.pushMatrix();

    gc.stroke(Color.GRAY.getRGB());
    gc.line(pos1[0], pos1[1], pos2[0], pos2[1]);

    gc.noStroke();
    gc.fill(new Color(33, 150, 24).getRGB());
    gc.ellipse(pos2[0] - ((pos2[0] - pos1[0]) / 6),
               pos2[1] - ((pos2[1] - pos1[1]) / 6),
               gc.markWidth / 3,
               gc.markWidth / 3);

    gc.popMatrix();
  }
}
