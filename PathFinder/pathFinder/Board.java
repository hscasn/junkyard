package pathFinder;

/**
 * Board
 *
 * Represents a Board
 *
 * @author Henrique Salvadori Coelho - henriquesc@gmail.com - hcoelho.com
 */

public class Board {

  // The characters below represent the possible states of every cell in the board
  public static final char CELL_EMPTY    = ' ';
  public static final char CELL_OBSTACLE = 'O';
  public static final char CELL_VISITED  = '-';
  public static final char CELL_ROUTE    = '.';
  public static final char CELL_START    = 'S';
  public static final char CELL_FINISH   = 'F';

  private char[] board;

  private final int boardSize;
  private final int boardWidth;
  private final int boardHeight;

  private final Mark startPoint;
  private final Mark finishPoint;

  /**
   * Start the board object
   *
   * @param x The number of columns the board has
   * @param y The number of rows the board has
   */
  public Board(int x, int y, Mark start, Mark finish) {
    boardWidth = x;
    boardHeight = y;
    boardSize = x * y;
    startPoint = start;
    finishPoint = finish;

    board = new char[boardSize];

    for (int i = 0; i < boardSize; i++) {
      board[i] = CELL_EMPTY;
    }

    board[markToMap(startPoint)]  = CELL_START;
    board[markToMap(finishPoint)] = CELL_FINISH;
  }

  /**
   * Copy constructor for the object
   *
   * @param that Object to be copied
   */
  public Board(Board that) {
    this.boardHeight = that.boardHeight;
    this.boardWidth  = that.boardWidth;
    this.boardSize   = that.boardSize;
    this.startPoint  = that.startPoint;
    this.finishPoint = that.finishPoint;

    board = new char[boardSize];

    for (int i = 0; i < boardSize; i++) {
      this.board[i] = that.board[i];
    }
  }

  /**
   * Getter for the height of the board
   *
   * @return The height of the board
   */
  public int height() {
    return boardHeight;
  }

  /**
   * Getter for the width of the board
   *
   * @return The width of the board
   */
  public int width() {
    return boardWidth;
  }

  /**
   * Gets the cell at a position in the board
   *
   * @param m The coordinate of the cell
   * @return The cell in the board
   * @throws ArrayIndexOutOfBoundsException In case the position is invalid
   */
  public char at(Mark m) {
    int map = markToMap(m);
    if (map > boardSize - 1) { throw new ArrayIndexOutOfBoundsException("Coordinate " + map + " is out of bounds."); }
    return board[map];
  }

  /**
   * Receives a mark and puts an obstacle it that position
   *
   * @param point The unidimensinal coordinate for the obstacle
   * @throws ArrayIndexOutOfBoundsException In case the position is invalid
   */
  public void putObstacle(Mark point) {
    int map = markToMap(point);
    if (map > boardSize - 1) { throw new ArrayIndexOutOfBoundsException("Coordinate " + map + " is out of bounds."); }
    board[map] = CELL_OBSTACLE;
  }

  /**
   * Draws a line starting at the point specified. If the line is vertical, the line will grow downwards, if it is
   * horizontal, it will grow to the right.
   *
   * @param point The starting point of the line
   * @param length The length of the line
   * @param vertical True if the line grows vertically, false otherwise
   * @throws ArrayIndexOutOfBoundsException In case the line gets out of the board
   */
  public void putObstacleLine(Mark point, int length, boolean vertical) {
    Mark currentPoint = new Mark(point.x, point.y);
    int map;

    for (int i = 0; i < length; i++) {
      map = markToMap(point);
      if (map > boardSize - 1) { throw new ArrayIndexOutOfBoundsException("Coordinate " + map + " is out of bounds."); }

      board[markToMap(currentPoint)] = CELL_OBSTACLE;

      if (vertical && currentPoint.x < boardHeight - 1) {
        currentPoint.x += 1;
      } else if (!vertical && currentPoint.y < boardWidth - 1) {
        currentPoint.y += 1;
      }
    }
  }

  /**
   * Receives a coordinate and marks it as visited
   *
   * @param m The position of the visited cell
   * @throws ArrayIndexOutOfBoundsException In case the line gets out of the board
   */
  public void putVisitedMark(Mark m) {
    int map = markToMap(m);
    if (map > boardSize - 1) { throw new ArrayIndexOutOfBoundsException("Coordinate " + map + " is out of bounds."); }

    // Puts the visite only if the cell is empty
    if (board[map] == CELL_EMPTY) {
      board[map] = CELL_VISITED;
    }
  }


  /**
   * Receives a coordinate and marks it as a path
   *
   * @param m The position of the path cell
   * @throws ArrayIndexOutOfBoundsException In case the line gets out of the board
   */
  public void putPath (Mark m) {
    int map = markToMap(m);
    if (map > boardSize - 1) { throw new ArrayIndexOutOfBoundsException("Coordinate " + map + " is out of bounds."); }

    // Puts the route only if it the current spot is empty
    if (board[map] == CELL_EMPTY) { board[map] = CELL_ROUTE; }
  }

  /**
   * Receives an unidimensional coordinate and transforms it into a mark
   *
   * @param m The unidimensional coordinate
   * @return a Mark object
   */
  private Mark mapToMark(int m) {
    int row = m / boardWidth;
    int col = m % boardWidth;

    return new Mark(row, col);
  }

  /**
   * Converts the XY coordinate into a unidimensional coordinate
   *
   * @param m The mark to be converted
   * @return the unidimensional coordinate
   */
  public int markToMap(Mark m) {
    return m.y + (m.x * boardWidth);
  }


  /**
   * Getter for starting point
   *
   * @return pathFinder.Mark with the starting point
   */
  public Mark startPoint() {
    return startPoint;
  }


  /**
   * Getter for final point
   *
   * @return Mark with the final point
   */
  public Mark finishPoint() {
    return finishPoint;
  }

  /**
   * Allows the board to be printed
   *
   * @return A string that represents the object
   */
  @Override
  public String toString() {
    StringBuilder out = new StringBuilder();

    // Printing the header of the board
    out.append("      ");
    for (int i = 0; i < boardWidth; i++) { out.append(i % 10); }
    out.append(' ').append(System.lineSeparator()).append("     +");
    for (int i = 0; i < boardWidth; i++) { out.append("-"); }
    out.append('+').append(System.lineSeparator());

    // Printing each cell
    for (int i = 0; i < boardSize; i++) {
      // If printing the first cell, prints first a border and a row number
      if (i % boardWidth == 0) {
        out.append("    ").append((i / boardWidth) % 10).append('|');
      }

      out.append(board[i]); // Printing the content of the cell

      // If printing the last cell, prints a border after and breaks the line
      if ((i + 1) % boardWidth == 0 && i != 0) {
        out.append('|').append((i / boardWidth) % 10).append(System.lineSeparator ());
      }
    }

    // Printing the footer of the board
    out.append("     +");
    for (int i = 0; i < boardWidth; i++) { out.append("-"); }
    out.append('+').append(System.lineSeparator()).append("      ");
    for (int i = 0; i < boardWidth; i++) { out.append(i % 10); }
    out.append(' ').append(System.lineSeparator());

    return out.toString ();
  }
}