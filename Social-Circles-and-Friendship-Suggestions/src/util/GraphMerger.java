package util;

import graph.Graph;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;

/**
 * GraphMerger
 *
 * Utility class for merging a list of graphs into one graph
 *
 * @author Henrique Salvadori Coelho - hcoelho.com - henriquesc@gmail.com
 */


public class GraphMerger {

  /**
   * Merges a list of graphs into one
   *
   * @param graphs Graphs to be merged
   * @return The merged graph
   */
  public static Graph merge(List<Graph> graphs) {
    Graph finalGraph = new Graph();

    for (Graph graph : graphs) {
      HashMap<Integer, HashSet<Integer>> edges = graph.getEdges();

      for (Map.Entry<Integer, HashSet<Integer>> edge : edges.entrySet()) {
        finalGraph.addVertex(edge.getKey());

        for (Integer neighbor : edge.getValue()) {
          finalGraph.addVertex(neighbor);
          finalGraph.addEdge(edge.getKey(), neighbor);
        }
      }
    }

    return finalGraph;
  }
}
