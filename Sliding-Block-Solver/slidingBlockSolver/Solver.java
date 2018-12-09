package slidingBlockSolver;

import java.util.*;

/**
 * Solver
 *
 * This object accepts a board and solves it
 *
 * @author Henrique Salvadori Coelho - henriquesc@gmail.com
 */

public class Solver {

  private Board board;

  // A twin board is created by swapping 2 tiles of the board. If the twin board gets solved, it means that the board
  // used is not solvable
  private Board twinBoard;
  
  private LinkedList<Board> solution; // Steps to the solution

  private int moves; // How many moves must be made to solve the board

  private boolean solvable; // Is the board solvable?

  /**
   * Receives a Board and tries to solve it
   *
   * @param b The board to be solved
   */
  public Solver(Board b) {
    this.board     = b;
    this.twinBoard = b.twin();
    this.solvable  = false;
    this.moves     = -1;

    solve();
  }

  /**
   * Solves the board
   */
  private void solve() {

    // Queues of boards to visit
    PriorityQueue<Board> queue     = new PriorityQueue<>();
    PriorityQueue<Board> twinQueue = new PriorityQueue<>();

    // Visited boards
    TreeSet<Board> visited     = new TreeSet<>(new BoardComparator());
    TreeSet<Board> twinVisited = new TreeSet<>(new BoardComparator());

    // List of parents for every board
    HashMap<Board, Board> parents = new HashMap<>();

    // Previous board visited
    Board previousBoard     = null;
    Board previousTwinBoard = null;

    // Solution, when found
    Board solutionBoard;

    // Adding the initial boards to the queue
    queue    .add(new Board(board    ));
    twinQueue.add(new Board(twinBoard));

    // Looping while the solution was not found
    while (true) {

      // If one the queue gets empty, none of the boards are solvable
      if (queue.isEmpty() || twinQueue.isEmpty()) { return; }

      // Removing the first boards of each stack
      Board currentBoard     = queue    .remove();
      Board currentTwinBoard = twinQueue.remove();

      // If the twin board got solved, stops the routine - the board is not solvable
      if (currentTwinBoard.solved()) { return; }

      // If the board got solved, sets the solution board as the current board, sets the necessary moves as the current
      // board's moves, and solvable as true. It also breaks out of the loop.
      if (currentBoard.solved()) {
        solutionBoard = currentBoard;
        moves         = currentBoard.moves;
        solvable      = true;
        break;
      }

      // For the neighbors of the current board
      for (Board n : currentBoard.neighbors()) {
        // If this board is not the same as the previous and was also not visited, increments the required moves, puts
        // the board and its parent in the parents list, adds the neighbor to the queue, and adds it to the visited list
        if ((previousBoard == null || n != previousBoard) && !visited.contains(n)) {
          n.moves = currentBoard.moves + 1;
          parents.put(n, currentBoard);
          queue.add(n);
          visited.add(n);
        }
      }

      // For the neighbors of the current twin board
      for (Board n : currentTwinBoard.neighbors()) {
        // If this board is not the same as the previous and was also not visited, increments the required moves, adds
        // the neighbor to the queue, and adds it to the visited list
        if ((previousTwinBoard == null || n != previousTwinBoard) && !twinVisited.contains(n)) {
          n.moves = currentTwinBoard.moves + 1;
          twinQueue.add(n);
          twinVisited.add(n);
        }
      }

      // Sets the previous boards as the current ones
      previousBoard     = currentBoard;
      previousTwinBoard = currentTwinBoard;
    }

    // If the routine got here, the solution was found. Traces back the solution to the initial board
    traceSolution(solutionBoard, parents);
  }

  /**
   * Traces the solution board back to the initial board. It populates the attribute "solution"
   *
   * @param solutionBoard The solved board
   * @param parents A Map with all the parents of the solution board
   */
  private void traceSolution(Board solutionBoard, HashMap<Board, Board> parents) {
    solution = new LinkedList<>();
    Board currentBoard = solutionBoard;

    while (currentBoard != null) {
      solution.addFirst(currentBoard);
      currentBoard = parents.get(currentBoard);
    }
  }

  /**
   * @return Returns True if the board is solvable, False otherwise
   */
  public boolean solvable() {
    return solvable;
  }

  /**
   * @return The number of moves to reach the solution. If the board is not solvable, returns -1
   */
  public int moves() {
    return moves;
  }

  /**
   * @return A list with path to the solution
   */
  public List<Board> solution() {
    return solution;
  }

  /**
   * This object represents a slidingBlockSolver.Board that can be comparable. It is used for the tree of visited boards
   */
  private class BoardComparator implements Comparator<Board> {

    @Override
    public int compare(Board x, Board y) {

      for (int i = 0; i < x.dimension(); i++) {
        for (int j = 0; j < x.dimension(); j++) {

          int difference = x.peek(i, j) - y.peek(i, j);
          if (difference != 0) {
            return difference;
          }

        }
      }

      return 0;
    }

  }
}
