package ui;

import graph.Graph;
import util.GraphLoader;

import javax.swing.*;
import java.awt.*;

/**
 * App
 *
 * GUI executable
 *
 * @author Henrique Salvadori Coelho - hcoelho.com - henriquesc@gmail.com
 */

public class App extends JFrame {

  /**
   * Creates the window and displays the content
   *
   * @param g Graph to be displayed
   * @param showEdgesDefault True if the application shows the edges by default, false otherwise
   */
  public App(Graph g, boolean showEdgesDefault) {
    final int width  = 800 + 60;
    final int height = 800 + 60;
    final String windowTitle = "Social Network Circles";

    this.setTitle(windowTitle);
    this.setSize(width, height);

    this.setPreferredSize(new Dimension(width, height));
    this.setMinimumSize  (new Dimension(width, height));
    this.setMaximumSize  (new Dimension(width, height));

    ScrollPane panel = new ScrollPane(ScrollPane.SCROLLBARS_ALWAYS);
    panel.add(new GraphPane(g, showEdgesDefault));
    panel.setVisible(true);
    this.add(panel);
    this.setLocationRelativeTo(null);

    this.setVisible(true);
  }

  /**
   * Executable
   *
   * @param args Arguments (not used)
   */
  public static void main(String[] args) {
    Graph g = new Graph();
    GraphLoader.loadGraph(g, "scctest.txt");
    new App(g, true);
  }
}
