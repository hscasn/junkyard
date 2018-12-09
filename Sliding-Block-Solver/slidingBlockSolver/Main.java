package slidingBlockSolver;

import java.io.File;
import java.util.Scanner;

/**
 * Main
 *
 * Test unit for the solver object
 *
 * @author Henrique Salvadori Coelho - henriquesc@gmail.com
 */

public class Main {

  private boolean printSolutions;

  // Change this string if you want to use another folder with test cases
  private final String testCaseFolder = "testCases";

  public static void main(String[] args) {
    Main m = new Main();

    System.out.println("Solving puzzles in folder " + m.testCaseFolder);

    Scanner in = new Scanner(System.in);
    System.out.print("Would you like to try all test cases (no solution output) or only one? (0 = all, 1 = one) ");
    int option = -1;

    while (option != 0 && option != 1) {
      try {
        option = in.nextInt();
      } catch (Exception e) {
        option = -1;
        in.nextLine();
      }
      if (option != 0 && option != 1) {
        System.out.println("Invalid choice");
        System.out.print("Would you like to try all test cases (no solution output) or only one? (0 = all, 1 = one) ");
      }
    }

    m.printSolutions = option == 1;

    if (m.printSolutions) {
      System.out.print("Type the name of the file: ");
      String fileName = in.next();
      File file = new File(m.testCaseFolder + "/" + fileName);
      m.solve(file);
    } else {
      File testCasesFolder = new File(m.testCaseFolder);

      for (File file : testCasesFolder.listFiles()) {
        m.solve(file);
      }
    }
  }

  private void solve(File puzzleFile) {

    System.out.print("Trying " + puzzleFile.getName());

    try {
      Scanner in = new Scanner(puzzleFile);

      int N = in.nextInt();
      int[][] blocks = new int[N][N];

      for (int i = 0; i < N; i++) {
        for (int j = 0; j < N; j++) {
          blocks[i][j] = in.nextInt();
        }
      }
      Board board = new Board(blocks);

      Solver solver = new Solver(board);

      if (!solver.solvable()) {
        System.out.println(" - " + "No solution possible");
      } else {
        System.out.println(" - " + "Solved in " + solver.moves() + " moves");

        if (printSolutions) {
          solver.solution().forEach(System.out::println);
        }
      }

    } catch (Exception e) {
      System.out.println("There was an error when trying to open the file. Check if the file really exists and if it" +
        "is located in the " + testCaseFolder + " folder.");
    }
  }
}
