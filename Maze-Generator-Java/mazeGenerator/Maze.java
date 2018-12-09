package mazeGenerator;

import java.util.*;

/**
 * Board
 *
 * Represents a Maze
 *
 * @author Henrique Salvadori Coelho - henriquesc@gmail.com - hcoelho.com
 */

public class Maze {

  // Charactes for the blocks in the maze
  public static final char BOARD_WALL   = '#';
  public static final char BOARD_EMPTY  = ' ';
  public static final char BOARD_START  = ' ';
  public static final char BOARD_FINISH = ' ';

  private final Random seed;
  private final int size;
  private final int totalSize;
  private final int startPoint;
  private final int finishPoint;

  private char[] board;
  private HashSet<Integer>[] links; // Child-parent between cells

  public Maze(int size) {
    if (size > 101 || size < 7 || size % 2 == 0) {
      throw new IllegalArgumentException ("Board size not correctly set. It must be an odd number between 7 and 101.");
    }

    this.size = size / 2; // The real size (width and height) are only half of the board, the rest are walls
    this.totalSize = this.size * this.size; // Width * Height
    this.links = new HashSet[totalSize + size];
    this.startPoint = 0;
    this.finishPoint = totalSize - 1;

    // Initializing the board. The loop goes to an additional row at the end to initialize the "links" hashset, in order
    // to create the finish point in the last row, but it is not recorded in the "board" array.
    this.board = new char[totalSize];
    for (int i = 0; i < totalSize + size; i++) {
      links[i] = new HashSet();
      if (i < totalSize) { board[i] = BOARD_WALL; }
    }

    // Placing the start and finish point
    board[startPoint]  = BOARD_START;
    board[finishPoint] = BOARD_FINISH;

    this.seed = new Random();

    // Building the maze
    buildMaze();
  }

  /**
   * This method is responsible for building the maze. The maze starts as a "solid block" of walls, and this algorithm
   * will create paths through the maze until there are no available paths left between the walls
   */
  private void buildMaze() {
    boolean foundFinish = false;

    // Looping while there still are breakable walls in the maze
    do {

      boolean hasAvailableCell;

      // Getting a cell that contains a wall. If the finish cell has not been reached yet, it can also count as a wall
      int currentCell = getCellWithWall(!foundFinish);

      // Looping to expand the path until it cannot be expanded anymore
      do {
        int selectedCell = getRandomWall(currentCell, !foundFinish);

        // If there is an available cell next to the current one, jumps to it
        hasAvailableCell = selectedCell > -1;
        if (hasAvailableCell) {

          // If it reached the finish, stops this path and starts a new one
          if (selectedCell == totalSize - 1) {
            foundFinish = true;
            hasAvailableCell = false;
          } else {
            board[selectedCell] = BOARD_EMPTY;
          }

          // Creating links between the cells
          links[currentCell] .add(selectedCell);
          links[selectedCell].add(currentCell);

          currentCell = selectedCell;
        }

      } while (hasAvailableCell);

    } while (getCellWithWall(!foundFinish) > -1);
  }

  /**
   * Loops through the board and returns the first cell with valid wall parents that it finds. If it doesn't find
   * anything, returns -1.
   *
   * @param acceptFinish If true, the finish cell is treated as a wall and can be returned as a valid cell
   * @return A random neighbor cell
   */
  private int getCellWithWall(boolean acceptFinish) {
    int foundCell = -1;

    for (int i = 0; i < totalSize; i++) {
      int tmpCell = getRandomWall(i, acceptFinish);
      if (tmpCell > -1) {
        foundCell = i;
        break;
      }
    }

    return foundCell;
  }

  /**
   * Receives a cell and chooses 1 random parent that is a wall to return (only valid wall parents are returned, if
   * there are no valid parents, the function returns -1)
   *
   * @param cell A cell which should contain neighbor walls
   * @param acceptFinish If true, the finish cell is treated as a wall and can be returned as a valid cell
   * @return A random neighbor that is a wall
   */
  private int getRandomWall(int cell, boolean acceptFinish) {
    List<Integer> validParents = new LinkedList<>();

    int currentRow = getRow(cell);

    // Getting all the possible neighbors. If a cell is invalid (out of bounds or overflowing row), the value is -1
    int cellTop    = cell - size;
    int cellRight  = getRow(cell + 1) == currentRow ? cell + 1 : -1;
    int cellBottom = cell + size;
    int cellLeft   = getRow(cell - 1) == currentRow ? cell - 1 : -1;

    // If the parents are valid, adds them to the list
    if (isValidWallOrFinish(cellTop   , acceptFinish)) { validParents.add(cellTop   ); }
    if (isValidWallOrFinish(cellRight , acceptFinish)) { validParents.add(cellRight ); }
    if (isValidWallOrFinish(cellBottom, acceptFinish)) { validParents.add(cellBottom); }
    if (isValidWallOrFinish(cellLeft  , acceptFinish)) { validParents.add(cellLeft  ); }

    // If none parent is valid, returns -1
    return validParents.isEmpty() ? -1 : validParents.get(Math.abs(seed.nextInt() + cell) % validParents.size());
  }

  /**
   * Helper for getRandomWall. This method receives a position of a cell and verifies if it is a wall or not
   *
   * @param cellPosition Position of the cell
   * @param acceptFinish Treat the finish cell as a wall or not
   * @return True if the cell is a valid wall, false otherwise
   */
  private boolean isValidWallOrFinish(int cellPosition, boolean acceptFinish) {
    if (cellPosition >= 0 && cellPosition < totalSize) {
      char cellValue = board[cellPosition];
      if (acceptFinish) {
        return (cellValue == BOARD_WALL || cellPosition == finishPoint) && cellPosition != startPoint;
      } else {
        return cellValue == BOARD_WALL && cellPosition != startPoint && cellPosition != finishPoint;
      }
    } else {
      return false;
    }
  }

  /**
   * Converts the position of a cell to the index of the row it belongs to
   *
   * @param cell The position of the cell to be converted
   * @return The row the cell belongs to
   */
  private int getRow(int cell) {
    return cell / size;
  }

  /**
   * Converts the position of a cell to the index of the column it belongs to
   *
   * @param cell The position of the cell to be converted
   * @return The column the cell belongs to
   */
  private int getCol(int cell) {
    return cell % size;
  }

  /**
   * Verifies if there is a link between two cells (if there is no link, there's a wall between them)
   *
   * @param cell1 First cell
   * @param cell2 Second cell
   * @return True if they are linked, false otherwise
   */
  private boolean hasLink(int cell1, int cell2) {
    if (links[cell1].contains(cell2)) { return true; }
    return false;
  }

  /**
   * Returns the size (width or height) of the maze
   *
   * @return An integer with the size of the maze
   */
  public int size() {
    return size;
  }

  /**
   * Allows the maze to be printed
   *
   * @return A string that represents the state of the object
   */
  @Override
  public String toString() {
    StringBuilder out = new StringBuilder();

    // Making an exit
    int a = totalSize - 1;
    int b = (totalSize - 1) + size;
    links[a].add(b);
    links[b].add(a);

    // Upper wall
    for (int i = 0; i < (size * 2) + 1; i++) {
      if (i == 1) { out.append(BOARD_EMPTY); }
      else        { out.append(BOARD_WALL); }
    }
    out.append(System.lineSeparator());

    // Holds the bottom wall for the rows
    StringBuilder bottomWall = new StringBuilder();

    for (int i = 0; i < totalSize; i++) {
      // Printing left border if needed
      if (getCol (i) == 0) {
        out.append(BOARD_WALL);
        bottomWall.append(BOARD_WALL);
      }

      // Printing the cell
      out.append(board[i]);

      // If there is a link between the cells vertically, prints an empty
      // path, otherwise, a wall in the bottom wall
      if (hasLink (i, i + size)) { bottomWall.append(BOARD_EMPTY); }
      else                       { bottomWall.append(BOARD_WALL); }

      // If there is a link between the cells horizontally, prints an empty
      // path, otherwise, a wall
      if (hasLink (i, i + 1)) { out.append(BOARD_EMPTY); }
      else                    { out.append(BOARD_WALL); }
      bottomWall.append(BOARD_WALL);

      // Finished printing the line, prints the right wall and the row below
      // with the maze walls
      if (getCol (i) == (size - 1)) {
        out.append(System.lineSeparator()).append(bottomWall.toString()).append(System.lineSeparator());
        bottomWall = new StringBuilder();
      }
    }

    return out.toString();
  }
}
