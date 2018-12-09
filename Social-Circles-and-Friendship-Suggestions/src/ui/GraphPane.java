package ui;

import graph.Graph;
import javax.swing.*;

/**
 * App
 *
 * GUI executable
 *
 * @author Henrique Salvadori Coelho - hcoelho.com - henriquesc@gmail.com
 */

public class GraphPane extends JPanel {

  /**
   * Creates a pane with a graph canvas for the graph
   * @param g Graph for the canvas
   * @param showEdgesDefault If set to true, the canvas will be drawn with the edges showing by default
   */
  public GraphPane(Graph g, boolean showEdgesDefault) {
    GraphCanvas gc = new GraphCanvas(g, showEdgesDefault);
    gc.init();
    gc.setVisible(true);
    add(gc);
  }
}
