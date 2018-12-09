package util;

import graph.Graph;

import java.util.*;

/**
 * GraphCircles
 *
 * Utility class to find circles in a graph
 *
 * @author Henrique Salvadori Coelho - hcoelho.com - henriquesc@gmail.com
 */


public class GraphCircles {

  // Minimum threshold of circles with suggestions for the program to lower standards and suggest more distant friends.
  // If this limit is not reached for circles of 4 people, the program will search for circles of more people (up to 6).
  private final int PRIORITY_LOWER_THRESHOLD = 50;

  private HashMap<Integer, Node> edgeIndex;
  private final HashMap<Integer, HashSet<Integer>> edges;

  /**
   * Constructs the object
   *
   * @param g Graph to be searched for cycles
   */
  public GraphCircles(Graph g) {
    // Initializing the maps of edges
    this.edgeIndex = new HashMap<>(g.size());
    this.edges = g.getEdges();

    // All the edges from the graph
    HashMap<Integer, HashSet<Integer>> e = g.getEdges();

    // Adding all the vertices and edges to the index
    for (Integer edge : e.keySet()) {
      edgeIndex.put(edge, new Node(edge));
    }
  }

  /**
   * Determines which vertices are not directly associated (do not have edges) with a node
   *
   * @param g Graph to be searched
   * @param center Center node
   * @return List of integers (values of vertices) that are not linked to the center
   */
  public static List<Integer> getUnassociatedVertices(Graph g, int center) {
    List<Integer> vertices = new LinkedList<>();

    Set<Integer> allNodes = g.getEdges().keySet();

    allNodes.forEach(l -> {
      if (l != center && !g.getEdges().get(center).contains(l)) { vertices.add(l); }
    });

    return vertices;
  }

  /**
   * Gets all the circles in the graph for the center node. It tries to get as many small circles as possible,
   * increasing the ratio if the minimum threshold of circles was not reached (defined by PRIORITY_LOWER_THRESHOLD)
   *
   * @param center Center node
   * @return A list of graphs, each graph containing one circle
   */
  public final List<Graph> getCircles(int center) {
    List<Graph> list;
    int maxDistanceFromCenter = 2;

    do {
      list = getCircles(center, maxDistanceFromCenter++);
    } while (list.size() < PRIORITY_LOWER_THRESHOLD && maxDistanceFromCenter < 7);


    return list;
  }

  /**
   * Implementation of getCircles, this overload is responsible for the logic
   *
   * @param center Center node
   * @param maxDistanceFromCenter Is the maximum distance from the center accepted for the node to be considered valid
   * @return A list of graphs, each graph containing one circle
   */
  private final List<Graph> getCircles(int center, int maxDistanceFromCenter) {
    clearDistances();

    List<Graph> circles = new LinkedList<>();
    HashMap<Node, List<Node>> parents = new HashMap<>();
    Node centerNode = edgeIndex.get(center);

    Queue<Node> queue = new LinkedList<>();
    HashSet<Node> visited = new HashSet<>();

    Node currentNode;
    queue.add(centerNode);
    visited.add(centerNode);

    // Starting the DFS until the queue gets empty
    while(!queue.isEmpty()) {

      currentNode = queue.poll();

      // If the distance from the center is too large, don't explore the node
      if (currentNode.getDistance() < maxDistanceFromCenter) {

        // Iterating through the neighbors
        for (Node neighbor : currentNode.getNeighbors()) {

          // Avoiding going back in the same path
          if (parents.containsKey(currentNode) && parents.get(currentNode) == neighbor) { continue; }

          if (!visited.contains(neighbor)) {

            // If the neighbor was still not visited, sets its distance, adds it to the visited list and puts it in
            // the queue to be searched later
            neighbor.setDistance(currentNode.getDistance() + 1);
            visited.add(neighbor);
            queue.add(neighbor);

          } else if (neighbor != centerNode) {
            // If the neighbor was already visited, we found a circle, so we trace it back to the center node
            tracePath(currentNode, neighbor, centerNode, circles, parents);
          }

          // If this neighbor is not the center node, adds it to the parent list
          if (neighbor != centerNode) {
            if (!parents.containsKey(neighbor)) { parents.put(neighbor, new LinkedList<>()); }
            List<Node> list = parents.get(neighbor);
            if (!list.contains(currentNode)) { list.add(currentNode); }
          }
        }
      }
    }

    // If there are no circles, makes a graph with only the center node to return
    if (circles.isEmpty()) {
      Graph centerOnly = new Graph();
      centerOnly.addVertex(centerNode.getValue());
      circles.add(centerOnly);
    }

    return circles;
  }

  /**
   * Resets the distances of all nodes
   */
  private void clearDistances() {
    for (Node n : edgeIndex.values()) { n.setDistance(0); }
  }

  /**
   * Traces a circle starting from two nodes back to the center node, adding it to the graph list
   *
   * @param n1 Node 1
   * @param n2 Node 2
   * @param centerNode The center node, where the first two nodes should converge
   * @param circles The list of circles to insert a new graph
   * @param parents The list of parents for the nodes to be traced back
   */
  private void tracePath(Node n1, Node n2, Node centerNode, List<Graph> circles, HashMap<Node, List<Node>> parents) {
    Graph newGraph = new Graph();

    // If the distances of both nodes are less than 2, the circle is actually a triangle, so it is not valid
    if (n1.getDistance() + n2.getDistance() < 3) { return; }

    // Recording which parents were already used for this circle, so both paths will not merge. All the nodes used must
    // be recorded, except for the center node, since both paths will have to merge with it
    HashSet<Node> usedParents = new HashSet<>();

    // Queues of nodes to search
    @SuppressWarnings("unchecked") Queue<Node>[] nodes = new LinkedList[2];
    nodes[0] = new LinkedList<>();
    nodes[1] = new LinkedList<>();
    nodes[0].add(n1);
    nodes[1].add(n2);

    boolean[] foundCenter = {false, false};

    // Making sure the distance to the center node always decrease when we iterate
    int[] lastDistance = {Integer.MAX_VALUE, Integer.MAX_VALUE};

    // While we still have not found the center from both the nodes...
    while (!foundCenter[0] || !foundCenter[1]) {
      Node[] current = {null, null};

      // We iterate 2 times: tracing for n1 and then for n2
      for (int i = 0; i < 2; i++) {

        // Getting the next node, if the center was still not found
        if (!foundCenter[i]) {
          current[i] = getNodeFromBag(nodes[i], lastDistance[i], usedParents, centerNode);

          // If we ran out of nodes, this path is invalid
          if (current[i] == null) { return; }

          // Updating the distance and the parents
          lastDistance[i] = current[i].getDistance();
          usedParents.add(current[i]);

          // Did we find center node?
          if (current[i] == centerNode) {
            // Yes
            foundCenter[i] = true;

          } else {
            // No. Adding a new vertex and getting the path to the center
            newGraph.addVertex(current[i].getValue());
            nodes[i].addAll(parents.get(current[i]));
          }
        }

      } // for

    } // while

    // Adding the center node to the graph
    newGraph.addVertex(centerNode.getValue());

    // Checking if there are no identical graphs in the list already. If not, adding the current graph to the list
    for (Graph g : circles) { if (graphEqual(g, newGraph)) { return; } }

    // Adding the edges
    populateWithEdges(newGraph);

    // Adding the new graph to the list
    circles.add(newGraph);
  }

  /**
   * Gets a valid node from a bag. The node is valid if its distance does not exceed the maximum distance, it is not
   * present in the used parents list or it is the center node
   *
   * @param bag The bag with the nodes
   * @param maxDistance Maximum distance for the node to be valid (not inclusive)
   * @param usedParents The nodes already used
   * @param centerNode The center node
   * @return A node, if found, or null
   */
  private Node getNodeFromBag(Queue<Node> bag, int maxDistance, HashSet<Node> usedParents, Node centerNode) {
    Node node;
    boolean validDistance;
    boolean repeatedNode;
    boolean isCenter;

    do {
      if (bag.isEmpty()) { return null; }
      node = bag.poll();
      validDistance = node.getDistance() < maxDistance;
      repeatedNode = usedParents.contains(node);
      isCenter = node == centerNode;
    } while (!validDistance || (repeatedNode && !isCenter));

    return node;
  }

  /**
   * Receives a graph with vertices only and adds all the possible edges
   *
   * @param g Graph to be populated with edges
   */
  private void populateWithEdges(Graph g) {
    HashMap<Integer, HashSet<Integer>> graphEdges = g.getEdges();

    // Iterating through the vertices of the graph
    for (Map.Entry<Integer, HashSet<Integer>> graphEntry : graphEdges.entrySet()) {
      HashSet<Integer> graphEntryNeighbors = graphEntry.getValue();
      HashSet<Integer> edgeNeighbors =  edges.get(graphEntry.getKey());

      // Iterating through every neighbor of the corresponding edge
      for (Integer edgeNeighbor : edgeNeighbors) {

        // If the vertex also exists in the new graph, adds the edge
        if (graphEdges.containsKey(edgeNeighbor)) {
          graphEntryNeighbors.add(edgeNeighbor);
        }
      }

    }
  }

  /**
   * Compares two graphs
   *
   * @param a Graph 1
   * @param b Graph 2
   * @return True if the graphs are identical, false otherwise
   */
  private boolean graphEqual(Graph a, Graph b) {
    if (a.size() != b.size())               { return false; }
    if (a.getMaxValue() != b.getMaxValue()) { return false; }

    // Comparing and edges
    HashMap<Integer, HashSet<Integer>> entriesB = b.getEdges();
    for (Map.Entry<Integer, HashSet<Integer>> entryA : a.getEdges().entrySet()) {
      int keyA = entryA.getKey();

      if (entriesB.containsKey(keyA)) {

        HashSet<Integer> neighborsA = entryA.getValue();
        HashSet<Integer> neighborsB = entriesB.get(keyA);

        for (Integer nA : neighborsA) {
          if (!neighborsB.contains(nA)) { return false; }
        }
      } else {
        return false;
      }
    }

    return true;
  }


  /**
   * Inner class that represents a vertex in the graph. In addition to the value of the key, it also holds the distance
   * to the center node
   */
  private class Node {
    private int value;
    private int distanceFromCenter;

    /**
     * Creates a node
     * @param value Value (key) of the node
     */
    public Node(int value) {
      this.value = value;
      this.distanceFromCenter = 0;
    }

    /**
     * @return Value of the node
     */
    public int getValue() {
      return value;
    }

    /**
     * Sets the distance of the node to the center
     *
     * @param d The distance of the node
     */
    public void setDistance(int d) {
      this.distanceFromCenter = d;
    }

    /**
     * @return The distance of the node to the center
     */
    public int getDistance() {
      return distanceFromCenter;
    }

    /**
     * @return A list of the neighboring nodes
     */
    public List<Node> getNeighbors() {
      List<Node> neighbors = new LinkedList<>();
      edges.get(this.getValue()).forEach(l -> neighbors.add(edgeIndex.get(l)));

      return neighbors;
    }
  }
}
