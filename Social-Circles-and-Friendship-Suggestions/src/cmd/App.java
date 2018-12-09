package cmd;

import graph.Graph;
import util.GraphCircles;
import util.GraphLoader;
import util.GraphMerger;

import java.util.*;

/**
 * App
 *
 * Command line executable
 *
 * @author Henrique Salvadori Coelho - hcoelho.com - henriquesc@gmail.com
 */

public class App {
  private Graph g;
  private Scanner s;

  /**
   * Prompts the user continuously for a selection for the graph, stopping when the user selects 0
   *
   * @param g Graph to be displayed
   */
  public App(Graph g) {
    this.g = g;
    this.s = new Scanner(System.in);
    GraphCircles graphCircles = new GraphCircles(this.g);

    int choice;

    do {
      choice = promptMenu();
      int key;

      System.out.println(System.lineSeparator());

      switch (choice) {
        case 1: // Print graph
          System.out.println("Graph");
          System.out.println(g);
          break;
        case 2: // Egonets
          key = promptKey();
          System.out.println(System.lineSeparator());
          System.out.println("Egonet for user " + key);
          System.out.println(g.getEgonet(key));
          break;
        case 3: // SCCs
          System.out.println("SCCs");
          List<Graph> graphs = g.getSCCs();
          if (graphs == null) {
            System.out.println("The data is too large for the recursive implementation of SCC.");
          } else {
            System.out.println(GraphMerger.merge(g.getSCCs()));
          }
          break;
        case 4: // Suggestions
          key = promptKey();
          System.out.println(System.lineSeparator());

          List<Graph> circles = graphCircles.getCircles(key);

          HashMap<Integer, HashSet<Integer>> suggestions = new HashMap<>();

          // Getting the suggestions and assigning their priority (strength of the suggestion)
          circles.forEach(c ->
            GraphCircles.getUnassociatedVertices(c, key).forEach(l -> {
              int priority = c.size() - 3;
              if (!suggestions.containsKey(priority)) { suggestions.put(priority, new HashSet<>()); }
              suggestions.get(priority).add(l);
            })
          );

          if (suggestions.size() == 0) {
            System.out.println("No suggestions for user " + key);
          } else {
            System.out.println("Suggestions for user " + key + ":");
            System.out.println("* Ordered by descending strength: 1 = stronger suggestion");

            for (Map.Entry<Integer, HashSet<Integer>> suggestion : suggestions.entrySet()) {
              System.out.println("Strength " + suggestion.getKey() + ": " + suggestion.getValue().size() + " found");
              int count = 1;
              for (Integer suggestionVertex : suggestion.getValue()) {
                if (count == 51) { break; }
                System.out.println(count++ + "- " + suggestionVertex);
              }
            }
          }
          break;
      }

    } while (choice != 0);
  }

  /**
   * Prompts the user for a selection for the menu
   *
   * @return User's selection
   */
  private int promptMenu() {
    int choice;

    while (true) {
      printMenu();
      try {
        choice = Integer.parseInt(s.nextLine());
        if (choice >= 0 && choice <= 4) { return choice; }
      } catch (Exception e) {
        System.out.println("The selection typed is not a number" + System.lineSeparator());
        continue;
      }
      System.out.println("Invalid selection" + System.lineSeparator());
    }
  }

  /**
   * Prompts the user for a vertex in the graph
   *
   * @return The id of the vertex
   */
  private int promptKey() {
    int choice;

    while (true) {
      System.out.print  ("Type the key of the node: ");
      try {
        choice = Integer.parseInt(s.nextLine());

        if (g.getEdges().containsKey(choice)) { return choice; }
      } catch (Exception e) {
        System.out.println("The selection typed is not a number" + System.lineSeparator());
        continue;
      }

      System.out.println("Invalid selection" + System.lineSeparator());
    }
  }

  /**
   * Prints the menu
   */
  private void printMenu() {
    System.out.println(System.lineSeparator());
    System.out.println("Choose the desired action:");
    System.out.println("1- Display graph");
    System.out.println("2- Get egonet");
    System.out.println("3- Get SCCs");
    System.out.println("4- Get suggestions");
    System.out.println("0- Exit");
    System.out.print  ("> ");
  }

  /**
   * Executable
   *
   * @param args Arguments (not used)
   */
  public static void main(String[] args) {
    Graph g = new Graph();
    GraphLoader.loadGraph(g, "scctest.txt");
    new App(g);
  }
}
