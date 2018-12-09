package ui;

import graph.Graph;
import processing.core.PApplet;
import util.GraphCircles;
import util.GraphMerger;

import java.awt.Color;
import java.util.List;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.Map;

/**
 * GraphCanvas
 *
 * Creates a canvas and draws the graph with a UI
 *
 * @author Henrique Salvadori Coelho - hcoelho.com - henriquesc@gmail.com
 */

public class GraphCanvas extends PApplet {

  // All the edges and markers
  private HashMap<Integer, HashMap<Integer, Edge>> edges = new HashMap<>();
  private HashMap<Integer, Marker> markers = new HashMap<>();

  // Only the emphasized and active edges and markers
  private Marker selectedMarker = null;
  private LinkedList<Marker> emphasizedMarkers = new LinkedList<>();
  private LinkedList<Marker> activeMarkers = new LinkedList<>();
  private LinkedList<Edge> activeEdges = new LinkedList<>();

  // Graph and graph cycles
  private Graph graph;
  private GraphCircles graphCircles;

  // General settings for the display
  private final int     backgroundColor = Color.WHITE.getRGB();
  private final boolean showEdgesDefault;
  public  final int     markMargin = 4;
  public  final int     markWidth;
  private final int     windowWidth;
  private final int     windowHeight;
  public  final int     marksInWidth;
  public  final int     marksInHeight;
  public  final int     topMargin = 40;

  // Active menu button
  private int activeButton = 0;

  /**
   * Creates the canvas
   *
   * @param g Graph to be drawn
   * @param showEdgesDefault True for showing all the edges by default
   */
  public GraphCanvas(Graph g, boolean showEdgesDefault) {
    this.graph = g;
    this.showEdgesDefault = showEdgesDefault;
    this.graphCircles = new GraphCircles(g);

    // Looping through the edges of the graph and populating the active elements lists
    for (Map.Entry<Integer, HashSet<Integer>> entry : g.getEdges().entrySet()) {

      // Populating the markers list
      int key = entry.getKey();
      Marker m = new Marker(entry.getKey(), this);
      if (!markers.containsKey(key)) {
        markers.put(key, m);
      }

      for (Integer neighbor : entry.getValue()) {

        // Populating the markers list
        Marker mm = new Marker(neighbor, this);
        if (!markers.containsKey(neighbor)) {
          markers.put(neighbor, mm);
        }

        // Creating edges
        HashMap<Integer, Edge> edge;
        if (!edges.containsKey(key)) {
          edge = new HashMap<>();
          edges.put(key, edge);
        }
        edges.get(key).put(neighbor, new Edge(m, mm, this, false));
      }
    }

    // Calculating how many marks every row/column will have and how much space they will take
    int sqrtMarks = (int) Math.ceil(Math.sqrt(g.getMaxValue())); // Square root of the total number of markers
    int marksSpace = sqrtMarks * markMargin; // Size of the marker + margin

    // Expanding the marker if there's still space in the screen
    int mWidth = 10; // Width for the marker
    while ((mWidth + 1) * marksSpace < 760) { mWidth++; }
    markWidth = mWidth;

    // Adjusting the dimensions of the window
    windowWidth  = marksSpace * markWidth;
    windowHeight = marksSpace * markWidth;

    // Adjusting how many marks will be in a row/column
    marksInWidth  = windowWidth  / (markWidth * markMargin);
    marksInHeight = windowHeight / (markWidth * markMargin);
  }

  /**
   * Setup of the canvas, executed only once
   */
  public void setup () {
    size (windowWidth + topMargin, windowHeight);
    frameRate(24);
    resetAll();
  }

  /**
   * Loop for drawing the canvas
   */
  public void draw () {
    background(backgroundColor);
    drawButtons();

    // Drawing active edges and markers
    activeEdges.forEach(Edge::draw);
    activeMarkers.forEach(m -> {
      m.draw();
      m.popupIfSelected(mouseX, mouseY);
    });
  }

  /**
   * Event handler for when the mouse is clicked
   */
  @Override
  public void mouseClicked() {
    // Deselecting the active markers
    if (selectedMarker != null) {
      selectedMarker.deselect();
      selectedMarker = null;
    }

    // Detecting if a button was clicked
    if ((mouseX >= 5 && mouseX <= 74) && (mouseY >= 5 && mouseY <= 35)) {
      activeButton = 0;
      resetAll();
      return;
    }
    if ((mouseX >= 80 && mouseX <= 187) && (mouseY >= 5 && mouseY <= 35)) {
      activeButton = 1;
      resetAll();
      return;
    }
    if ((mouseX >= 193 && mouseX <= 248) && (mouseY >= 5 && mouseY <= 35)) {
      activeButton = 2;
      resetFromGraph(GraphMerger.merge(graph.getSCCs()));
      return;
    }

    // Depending on the active button, clicking on markers should not do anything
    boolean disabledMarkerClick = activeButton == 2;
    if (disabledMarkerClick) { return; }

    // Detecting if a marker was clicked
    for (Marker m : activeMarkers) {
      if (m.isSelected(mouseX, mouseY)) {
        selectedMarker = m;
        break;
      }
    }

    // A marker was clicked
    if (selectedMarker != null) {

      selectedMarker.select();
      Graph g;

      // Finding out the action to perform
      switch (activeButton) {

        // Suggestions
        case  1:
          List<Graph> circles = graphCircles.getCircles(selectedMarker.getValue());

          // Emphasizing the markers
          deemphasizeMarkers();
          circles.forEach(c ->
            GraphCircles.getUnassociatedVertices(c, selectedMarker.getValue()).forEach(l -> {
              Marker m = markers.get(l);
              int emphasis = c.size() - 3;
              if (m.getEmphasis() == 0) { emphasizedMarkers.add(m); } // Avoiding adding it again on the list
              // Emphasizing only if there's no emphasis or the new emphasis is stronger
              if (m.getEmphasis() == 0 || m.getEmphasis() > emphasis) { m.emphasize(c.size() - 3); }
            })
          );

          g = GraphMerger.merge(circles);
          resetFromGraph(g);

          break;

        // Egonet
        case 0:
        default:
          g = graph.getEgonet(selectedMarker.getValue());
          deemphasizeMarkers();
          resetFromGraph(g);
          break;

      }

    } else {
      resetAll();
    }
  }

  /**
   * Removes the emphasis for all the markers
   */
  private void deemphasizeMarkers() {
    emphasizedMarkers.forEach(Marker::deemphasize);
    emphasizedMarkers.clear();
  }

  /**
   * Resets the canvas, drawing a specific graph instead of the default one
   *
   * @param g Graph to be drawn
   */
  private void resetFromGraph(Graph g) {
    // Hiding all edges and markers
    activeMarkers.forEach(Marker::hide);
    activeMarkers.clear();
    activeEdges.forEach(Edge::hide);
    activeEdges.clear();

    // Getting the edges and markers from the graph received and showing them
    for (Map.Entry<Integer, HashSet<Integer>> entry : g.getEdges().entrySet()) {
      Marker m = markers.get(entry.getKey());
      m.show();
      activeMarkers.add(m);

      for (Integer neighbor : entry.getValue()) {
        Edge e = edges.get(entry.getKey()).get(neighbor);
        e.show();
        activeEdges.add(e);
      }
    }
  }

  /**
   * Resets all the markers and edges to their default state
   */
  private void resetAll() {
    // Clearing all the active markers and edges list
    activeMarkers.clear();
    activeEdges.clear();

    // Deemphasizing markers
    deemphasizeMarkers();

    // Showing all the markers and putting them in the list
    markers.values().forEach(l -> {
      activeMarkers.add(l);
      l.show();
    });

    // Showing/hiding all the edges and putting them in the list (if to be shown)
    edges.values().forEach(l -> l.values().forEach(m -> {
      if (showEdgesDefault) {
        m.show();
        activeEdges.add(m);
      } else {
        m.hide();
      }
    }));
  }

  /**
   * Draws the buttons on the canvas
   */
  private void drawButtons() {
    pushMatrix();
    noStroke();
    textSize(15);

    //fill(new Color(35, 106, 150).getRGB());
    //rect(5, 5, textWidth("Egonet") + 20, 30);
    fill(activeButton == 0 ? new Color(35, 106, 150).getRGB() : Color.BLACK.getRGB());
    text("Egonet", 15, 25);

    //fill(new Color(35, 106, 150).getRGB());
    //rect(80, 5, textWidth("Suggestions") + 20, 30);
    fill(activeButton == 1 ? new Color(35, 106, 150).getRGB() : Color.BLACK.getRGB());
    text("Suggestions", 90, 25);

    //fill(new Color(35, 106, 150).getRGB());
    //rect(193, 5, textWidth("SCCs") + 20, 30);
    fill(activeButton == 2 ? new Color(35, 106, 150).getRGB() : Color.BLACK.getRGB());
    text("SCCs", 203, 25);

    popMatrix();
  }

}
