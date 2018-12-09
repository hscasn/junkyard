package pathFinder;

import java.util.*;

/**
 * PathFinder
 *
 * Finds the route from start to finish through a board
 *
 * @author Henrique Salvadori Coelho - henriquesc@gmail.com - hcoelho.com
 */

public class PathFinder {
  private final Board board;
  private final boolean showVisited;
  private final boolean allowDiagonalMoves;

  private HashMap<Mark, Mark> parents;
  private TreeSet<Mark> visitedMarks;
  private List<Mark> route;

  private final Mark finishMark;

  /**
   * Starts the object
   *
   * @param board              Board to be solved
   * @param showVisited        True for displaying visited cells after finished solving, false otherwise
   * @param allowDiagonalMoves True for allowing the path to be diagonal, false otherwise
   */
  public PathFinder(Board board, boolean showVisited, boolean allowDiagonalMoves) {
    this.board = new Board(board);
    this.showVisited = showVisited;
    this.allowDiagonalMoves = allowDiagonalMoves;
    this.finishMark = board.finishPoint();
    this.route = new LinkedList<>();

    parents = new HashMap<>();

    visitedMarks = new TreeSet<>((a, b) -> {
      if      (a.y > b.y) { return  1; }
      else if (a.y < b.y) { return -1; }
      else if (a.x > b.x) { return  1; }
      else if (a.x < b.x) { return -1; }
      else                { return  0; }
    });

    if (!solveBoard()) {
      System.out.println("Unsolvable board");
    }
  }

  /**
   * Starts the process of solving the board, contains the main procedures for this
   */
  private boolean solveBoard() {
    PriorityQueue<ComparableMark> queue = new PriorityQueue<>();
    boolean solvable = false;
    List<ComparableMark> neighbors;

    // Adding the starting point to the queue
    ComparableMark currentMark = new ComparableMark(board.startPoint(), finishMark, 0);
    queue.add(currentMark);

    // While there are available cells to visit...
    while (!queue.isEmpty()) {
      currentMark = queue.poll();

      // Skipping this mark if it was already visited
      if (visitedMarks.contains(currentMark.mark)) { continue; }

      if (!isEnd(currentMark.mark)) {
        // Did not reach the end, getting the neighbors and adding them as children of this mark
        neighbors = getMarkNeighbors(currentMark);
        addNeighborsToQueue(queue, neighbors);
        addChildrenToParent(currentMark.mark, neighbors);
        visitedMarks.add(currentMark.mark);

      } else {
        // Reached the end
        solvable = true;
        break;
      }
    }

    if (!solvable) { return false; }

    // Tracing the route back to the starting point and putting it on the board. Putting
    // the visited marks on the board if required
    traceRoute(currentMark.mark);
    putRouteOnBoard();
    if (showVisited) {
      putVisitedOnBoard();
    }

    return true;
  }

  /**
   * Checks if a mark is the finish point
   *
   * @param m pathFinder.Mark to be checked
   * @return True if it is the finish point, false otherwise
   */
  private boolean isEnd(Mark m) {
    return m.x == finishMark.x && m.y == finishMark.y;
  }

  /**
   * Records the route on the solution board
   */
  private void putRouteOnBoard() {
    for (Mark m : route) {
      board.putPath(m);
    }
  }

  /**
   * Records the visited marks on the solution board
   */
  private void putVisitedOnBoard() {
    for (Mark m : visitedMarks) {
      board.putVisitedMark(m);
    }
  }

  /**
   * Traces the route from the last mark to the starting point
   *
   * @param lastMark The last mark visited
   */
  private void traceRoute(Mark lastMark) {
    route.add(lastMark);
    while (parents.containsKey(lastMark)) {
      Mark child = parents.get(lastMark);
      route.add(child);
      lastMark = child;
    }
  }

  /**
   * Adds a relationship between the child mark and the parent
   *
   * @param parent   The parent of the child
   * @param children The child of the parent
   */
  private void addChildrenToParent(Mark parent, List<ComparableMark> children) {
    for (ComparableMark child : children) {
      parents.put(child.mark, parent);
    }
  }

  /**
   * Gets a list of the available neighbors for the pathFinder.Mark
   *
   * @param mark pathFinder.Mark to get the neighbors from
   * @return A list of the neighbors
   */
  private List<ComparableMark> getMarkNeighbors(ComparableMark mark) {
    Mark m = mark.mark;
    List<ComparableMark> neighbors = new LinkedList<>();

    boolean canMoveUp = m.y > 0;
    boolean canMoveDown = m.y < board.height() - 1;
    boolean canMoveLeft = m.x > 0;
    boolean canMoveRight = m.x < board.width() - 1;

    float linearMove = mark.moves + 1f;
    float diagonalMove = mark.moves + 1.3f;

    if (canMoveUp) {
      addNeighborIfValid(neighbors, makeComparableMark(m.x, m.y - 1, linearMove));
    }
    if (canMoveRight) {
      addNeighborIfValid(neighbors, makeComparableMark(m.x + 1, m.y, linearMove));
    }
    if (canMoveDown) {
      addNeighborIfValid(neighbors, makeComparableMark(m.x, m.y + 1, linearMove));
    }
    if (canMoveLeft) {
      addNeighborIfValid(neighbors, makeComparableMark(m.x - 1, m.y, linearMove));
    }

    // Moving diagonally, if allowed
    if (allowDiagonalMoves) {
      if (canMoveUp && canMoveRight) {
        addNeighborIfValid(neighbors, makeComparableMark(m.x + 1, m.y - 1, diagonalMove));
      }
      if (canMoveDown && canMoveRight) {
        addNeighborIfValid(neighbors, makeComparableMark(m.x + 1, m.y + 1, diagonalMove));
      }
      if (canMoveDown && canMoveLeft) {
        addNeighborIfValid(neighbors, makeComparableMark(m.x - 1, m.y + 1, diagonalMove));
      }
      if (canMoveUp && canMoveLeft) {
        addNeighborIfValid(neighbors, makeComparableMark(m.x - 1, m.y - 1, diagonalMove));
      }
    }

    return neighbors;
  }

  /**
   * Factory for comparable marks
   *
   * @param x The X position of the mark
   * @param y The Y position of the mark
   * @param moveCost The cost of the move for the marker
   * @return A ComparableMark
   */
  private ComparableMark makeComparableMark(int x, int y, float moveCost) {
    Mark newMark = new Mark(x, y);
    ComparableMark newComparableMark = new ComparableMark(newMark, board.finishPoint (), moveCost);
    return newComparableMark;
  }

  /**
   * Adds a neighbor to a list of neighbors in case it has not been visited already. For a neighbor to be valid, it also
   * must be an empty cell
   *
   * @param neighbors List of neighbors
   * @param neighbor  Neighbor to be added
   */
  private void addNeighborIfValid(List<ComparableMark> neighbors, ComparableMark neighbor) {
    if (board.at(neighbor.mark) == board.CELL_EMPTY || board.at(neighbor.mark) == board.CELL_FINISH) {
      neighbors.add(neighbor);
    }
  }

  /**
   * Adds a list of neighbors to the neighbor priority queue
   *
   * @param queue       Priority queue to add the neighbors to
   * @param neighbors   Neighbors to be added to the queue
   */
  private void addNeighborsToQueue(PriorityQueue<ComparableMark> queue, List<ComparableMark> neighbors) {
    for (ComparableMark n : neighbors) {
      queue.add(n);
    }
  }

  /**
   * A comparable mark contains a comparable parameter (distance) and is used by the algorithm to prioritize the
   * marks to be visited
   */
  private class ComparableMark implements Comparable {
    public final Mark mark;
    public final int distance;
    public final float moves;

    public ComparableMark(Mark mark, Mark finish, float moves) {
      this.mark = mark;
      this.moves = moves;
      this.distance = Math.abs(mark.x - finish.x) + Math.abs(mark.y - finish.y);
    }

    @Override
    public int compareTo(Object t) {
      if (t.getClass() != this.getClass()) {
        throw new IllegalArgumentException("Not comparable objects");
      }
      ComparableMark that = (ComparableMark) t;
      return ((Float) (this.distance + this.moves)).compareTo(that.distance + that.moves);
    }
  }


  /**
   * Allows the board to be printed
   *
   * @return A string that represents the object
   */
  @Override
  public String toString() {
    return board.toString();
  }
}