package util;

import graph.Graph;
import java.io.File;
import java.util.HashSet;
import java.util.Scanner;
import java.util.Set;

/**
 * @author UCSD MOOC development team
 *
 * Utility class to add vertices and edges to a graph
 *
 */

public class GraphLoader {

  /**
   * Loads graph with data from a file.
   * The file should consist of lines with 2 integers each, corresponding
   * to a "from" vertex and a "to" vertex.
   */
  public static void loadGraph(graph.Graph g, String filename) {
    Set<Integer> seen = new HashSet<>();
    Scanner sc;
    try {
      sc = new Scanner(new File(filename));
    } catch (Exception e) {
      e.printStackTrace();
      return;
    }
    // Iterate over the lines in the file, adding new
    // vertices as they are found and connecting them with edges.
    while (sc.hasNextInt()) {
      Integer v1 = sc.nextInt();
      Integer v2 = sc.nextInt();
      if (!seen.contains(v1)) {
        g.addVertex(v1);
        seen.add(v1);
      }
      if (!seen.contains(v2)) {
        g.addVertex(v2);
        seen.add(v2);
      }
      g.addEdge(v1, v2);
    }

    sc.close();
  }

  public static void main(String[]_) {
    Graph g = new Graph();
    loadGraph(g, "scctest.txt");

    g.getSCCs().forEach(System.out::println);
  }
}
