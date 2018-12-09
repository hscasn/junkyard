package graph;

import java.util.*;

/**
 * Graph
 *
 * Represents a graph with vertices and edges
 *
 * @author Henrique Salvadori Coelho - hcoelho.com - henriquesc@gmail.com
 */

public class Graph {

  private HashMap<Integer, HashSet<Integer>> edges = new HashMap<>();
  private int maxValue = 0; // Records the biggest ID inserted in the graph

  // Avoiding a stack overflow on SCC
  private int stack;
  private final int stackLimit = 250;

  /**
   * @return Collection of edges present in the graph
   */
  public final HashMap<Integer, HashSet<Integer>> getEdges() {
    return edges;
  }

  /**
   * @return The biggest ID inserted in the graph
   */
  public int getMaxValue() {
    return maxValue;
  }

  /**
   * @return How many entries are in the graph
   */
  public int size() {
    return edges.size();
  }

  /**
   * Adds a vertex in the graph
   *
   * @param num Vertex to be added
   */
  public void addVertex(Integer num) {
    if (!edges.containsKey(num)) { edges.put(num, new HashSet<>()); }
    if (num > maxValue) { maxValue = num; }
  }

  /**
   * Adds an edge (link) between to vertices
   *
   * @param from Starting point of the edge
   * @param to End point of the edge
   */
  public void addEdge(Integer from, Integer to) {
    if (edges.containsKey(from) && edges.containsKey(to)) {
      edges.get(from).add(to);
    }
  }

  /**
   * Gets the egonet of a vertex in the graph
   *
   * @param center Vertex to find the egonet
   * @return A graph with the egonet of the vertex
   */
  public Graph getEgonet(Integer center) {
    // Returning if the center does not exist
    if (!edges.containsKey(center)) { return null; }

    // The graph
    Graph g = new Graph();
    g.addVertex(center);

    // The neighbors
    HashSet<Integer> neighbors = new HashSet<>();

    // Finding the neighbors
    edges.get(center).forEach(l -> {
      neighbors.add(l);
      g.addVertex(l);
    });

    // Visiting every neighbor, if they have edges with a node present in neighbors, adds it to the graph
    neighbors.forEach(neighbor -> {
      HashSet<Integer> neighborEdges = edges.get(neighbor);
      neighborEdges.forEach(neighborEdge -> {
        if (neighborEdge.equals(center) || edges.containsKey(neighborEdge)) {
          g.addEdge(neighbor, neighborEdge);
        }
      });
    });

    // Adding the center's edges
    edges.get(center).forEach(l -> g.addEdge(center, l));

    return g;
  }

  /**
   * Calculates the Strong Connected Components
   * @return A list of graphs, each one represents one SCC
   */
  public List<Graph> getSCCs() {
    // Pushing all the edges in the vertice stack
    Stack<Integer> vertices = new Stack<>();
    edges.keySet().forEach(vertices::push);

    // Performing the first depth search
    Stack<Integer> finished = DFS(this, vertices, null);

    // If the finished stack is null, we had a stack overflow: aborting the method
    if (finished == null) { return null; }

    // Flipping the edges
    Graph flippedEdges = flipEdges();

    // Group of SCCs, each vertex here belongs to one SCC
    HashMap<Integer, HashSet<Integer>> SCC = new HashMap<>();

    // Second depth search, starting fom the opposite side and using the flipped edges
    DFS(flippedEdges, finished, SCC);

    // List of graphs with the SCCs
    LinkedList<Graph> graphs = new LinkedList<>();

    // Iterating through every SCC and getting the connections, adding them to a new graph
    for (Map.Entry<Integer, HashSet<Integer>> entry : SCC.entrySet()) {
      Graph g = new Graph();

      g.addVertex(entry.getKey());

      entry.getValue().forEach(g::addVertex);

      // Adding the edges
      for (Map.Entry<Integer, HashSet<Integer>> edge : g.edges.entrySet()) {
        edges.get(edge.getKey()).forEach(l -> {
          if (g.edges.containsKey(l)) {
            edge.getValue().add(l);
          }
        });
      }

      graphs.add(g);
    }

    return graphs;
  }

  /**
   * @return Returns a graph similar to the current used in the object, but with the directions of the edges flipped
   */
  public Graph flipEdges() {
    Graph g = new Graph();

    // Inserting all the vertices
    edges.keySet().forEach(g::addVertex);

    // Inserting the edges, but inverted
    for (Map.Entry<Integer, HashSet<Integer>> edge : edges.entrySet()) {
      edge.getValue().forEach(l -> g.addEdge(l, edge.getKey()));
    }

    return g;
  }

  /**
   * Performs a Depth First Search in the vertices
   *
   * @param g Graph for the search to be performed
   * @param vertices Vertices to be searched
   * @param SCC Set of SCC nodes to be recorded by this search
   * @return A list (stack) with the vertex searched
   */
  public Stack<Integer> DFS(Graph g, Stack<Integer> vertices, HashMap<Integer, HashSet<Integer>> SCC) {
    HashSet<Integer> visited = new HashSet<>();
    Stack<Integer> finished = new Stack<>();

    stack = 0;

    while (!vertices.isEmpty()) {
      Integer vertex = vertices.pop();

      HashSet<Integer> newlyVisited = new HashSet<>();

      if (!visited.contains(vertex)) {

        // Calling the DFS recursively
        DFS(g, vertex, visited, finished, newlyVisited);

        if (SCC != null) {
          SCC.put(vertex, newlyVisited);
        }

        visited.addAll(newlyVisited);
      }
    }

    if (stack > stackLimit) {
      return null;
    } else {
      return finished;
    }
  }

  /**
   * Performs a Depth First Search in the vertices. This method is not supposed to be called only by the other DFS
   * method by recursion
   *
   * @param g Graph for the search to be performed
   * @param vertex Vertex to be searched
   * @param visited Vertices visited
   * @param finished Stack with the vertices that have already been searched
   * @param newlyVisited Vertices visited by this method call
   */
  private void DFS(Graph g, Integer vertex, HashSet<Integer> visited,
                   Stack<Integer> finished, HashSet<Integer> newlyVisited) {

    if (stack++ > stackLimit) { return; }

    visited.add(vertex);
    if (newlyVisited != null) { newlyVisited.add(vertex); }

    g.edges.get(vertex).forEach(l -> {
      if (!visited.contains(l)) {
        DFS(g, l, visited, finished, newlyVisited);
      }
    });

    if (finished != null) { finished.push(vertex); }
  }

  /**
   * Makes the object printable
   *
   * @return A string with the printable state of the object
   */
  @Override
  public String toString() {
    StringBuilder b = new StringBuilder();

    for (Map.Entry<Integer, HashSet<Integer>> entry : edges.entrySet()) {
      b.append(entry.getKey()).append(" -> ");
      entry.getValue().forEach(l -> b.append(l).append(" "));
      b.append(System.lineSeparator());
    }

    return b.toString();
  }

}
