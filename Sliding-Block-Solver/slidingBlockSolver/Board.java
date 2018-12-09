package slidingBlockSolver;

import java.util.*;

/**
 * Board
 *
 * Represents a Board
 *
 * @author Henrique Salvadori Coelho - henriquesc@gmail.com
 */

public class Board implements Comparable<Board> {

  private List<Board> neighbors;

  private int[][] board;
  private int size;
  private int blockSize;

  // Manhattan and Hamming distances (how many positions are wrong and their distances to the solution)
  private int manhattan;
  private int hamming;

  // How many moves were made to reach this state
  public  int moves;

  // Position of the blank spot (gap)
  private int zeroI;
  private int zeroJ;

  /**
   * Accepts a matrix of integers and builds the board with it
   *
   * @param blocks Matrix with the integers for the block
   */
  public Board(int[][] blocks) {
    this.neighbors = null;

    this.manhattan = -1;
    this.hamming   = -1;

    this.zeroI = -1;
    this.zeroJ = -1;

    this.moves = 0;
    this.size  = blocks.length;
    this.board = copyMatrix(blocks);

    this.blockSize = (int)(Math.log10(this.size * this.size) + 1);
  }

  /**
   * Copy constructor. Accepts another board and copies all its properties
   *
   * @param that Board to be copied
   */
  public Board(Board that) {
    this.neighbors = that.neighbors;

    this.manhattan = that.manhattan;
    this.hamming   = that.hamming;

    this.zeroI = that.zeroI;
    this.zeroJ = that.zeroJ;

    this.moves = that.moves;
    this.size  = that.size;
    this.board = copyMatrix(that.board);

    this.blockSize = that.blockSize;
  }

  /**
   * @return The dimension of the board (rows * columns, total of cells)
   */
  public int dimension() {
    return board.length;
  }

  /**
   * @return The number of cells in the wrong position. If the number is 0, the board is solved
   */
  public int hamming() {
    if (hamming == -1) {
      hamming = 0;

      for (int i = 0; i < size; i++) {
        for (int j = 0; j < size; j++) {

          boolean lastPosition = i == size - 1 && j == size - 1;
          int expectedNumber   = (i * size) + j + 1;
          int actualNumber     = board[i][j];

          if (!lastPosition && expectedNumber != actualNumber) {
            hamming++;
          }

        }
      }
    }

    return hamming;
  }

  /**
   * Calculates the distance of this board to the solution. The distance is calculated based on the number of cells in
   * the wrong position and how many swapts the board needs to be solved.
   *
   * @return The distance of this board to the solution.
   */
  public int manhattan() {
    if (manhattan == -1) {
      manhattan = 0;

      for (int i = 0; i < size; i++) {
        for (int j = 0; j < size; j++) {

          int expectedNumber = (i * board.length + j + 1);
          int actualNumber = board[i][j];

          if (actualNumber != expectedNumber && actualNumber != 0) {
            int distanceToI = Math.abs( ((actualNumber - 1) / dimension()) - i );
            int distanceToJ = Math.abs( ((actualNumber - 1) % dimension()) - j );
            manhattan += distanceToI + distanceToJ;
          }

        }
      }
    }
    return manhattan;
  }

  /**
   * @return Returns true if the board is solved, false otherwise
   */
  public boolean solved() {
    return hamming() == 0;
  }

  /**
   * Accepts a position in the board (row, column) and returns the content of the cell
   *
   * @param i Row
   * @param j Column
   * @return The value of the cell in the requested position. If the position is illegal, the number returned is -1.
   */
  public int peek(int i, int j) {
    if (i >= size || j >= size) { return -1; }
    return board[i][j];
  }

  /**
   * Generates a twin board, where two numbers (except for 0) are flipped. This is used to verify if the board is
   * solvable or not. If the twin board is solvable, the original is not.
   *
   * @return A matrix of ints with the twin board.
   */
  public Board twin() {
    int[][] newBoard = copyMatrix(board);

    int row = newBoard[0][0] == 0 || newBoard[0][1] == 0 ? 1 : 0;

    int tmp = newBoard[row][0];

    newBoard[row][0] = newBoard[row][1];
    newBoard[row][1] = tmp;

    return new Board(newBoard);
  }

  /**
   * Compares two boards and returns true or false
   *
   * @param that Is another board to be compared to this
   * @return True if both boards are the same or similar boards, false otherwise
   */
  @Override
  public boolean equals(Object that) {
    if (this == that                                  ) { return true;  }
    if (that == null                                  ) { return false; }
    if (this.getClass()  != that.getClass()           ) { return false; }
    if (this.dimension() != ((Board) that).dimension()) { return false; }

    for (int i = 0; i < size; i++) {
      for (int j = 0; j < size; j++) {
        if (this.board[i][j] != ((Board) that).board[i][j]) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Compares two boards and returns an integer that represents their priorities:
   * < 1 = This board is closer to be solved
   * 0   = The boards are both equally closer
   * > 1 = That board is closer to be solved
   *
   * @param that slidingBlockSolver.Board to be compared to this
   *
   * @return An integer that represents their priorities
   */
  @Override
  public int compareTo(Board that) {
    int manhattan = (this.manhattan() + this.moves) - (that.manhattan() + that.moves);

    if (manhattan == 0) {
      return (this.hamming() + this.moves) - (that.hamming() + that.moves);
    } else {
      return manhattan;
    }
  }

  /**
   * Allows the board to be printed
   *
   * @return A string that represents the printable object
   */
  @Override
  public String toString() {
    StringBuilder s = new StringBuilder();

    for (int i = 0; i < size; i++) {
      for (int j = 0; j < size; j++) {
        String cell = (board[i][j] == 0) ? " " : String.valueOf(board[i][j]);
        s.append(String.format("%" + (blockSize + 1) + "s", cell));
      }
      s.append(System.lineSeparator());
    }

    return s.toString();
  }

  /**
   * @return A list with the possible neighbors for this board
   */
  public Iterable<Board> neighbors() {
    if (neighbors == null) {
      getNeighbors();
    }
    return neighbors;
  }

  /**
   * Private method that finds the possible neighbors and adds to the neighbor list
   */
  private void getNeighbors() {
    neighbors = new LinkedList<>();
    Board newBoard;

    // Finds where the gap (spot without a piece)
    if (zeroI == -1 || zeroJ == -1) {
      findGap();
    }

    // Creates new boards based on this one and shifts the gap up, down, left and right (if possible)
    // Up
    if (zeroI > 0) {
      newBoard = new Board(this.board);
      newBoard.board[zeroI][zeroJ] = newBoard.board[zeroI - 1][zeroJ];
      newBoard.board[zeroI - 1][zeroJ] = 0;
      neighbors.add(newBoard);
    }

    // Down
    if (zeroI < board.length - 1) {
      newBoard = new Board(this.board);
      newBoard.board[zeroI][zeroJ] = newBoard.board[zeroI + 1][zeroJ];
      newBoard.board[zeroI + 1][zeroJ] = 0;
      neighbors.add(newBoard);
    }

    // Left
    if (zeroJ > 0) {
      newBoard = new Board(this.board);
      newBoard.board[zeroI][zeroJ] = newBoard.board[zeroI][zeroJ - 1];
      newBoard.board[zeroI][zeroJ - 1] = 0;
      neighbors.add(newBoard);
    }

    // Right
    if (zeroJ < board.length - 1) {
      newBoard = new Board(this.board);
      newBoard.board[zeroI][zeroJ] = newBoard.board[zeroI][zeroJ + 1];
      newBoard.board[zeroI][zeroJ + 1] = 0;
      neighbors.add(newBoard);
    }
  }

  /**
   * Receives a matrix if integers and clones it
   *
   * @param source The matrix to be cloned
   * @return The new matrix
   */
  private int[][] copyMatrix(int[][] source) {
    int[][] target = new int[size][size];

    for (int i = 0; i < size; i++) {
      for (int j = 0; j < size; j++) {
        target[i][j] = source[i][j];
      }
    }

    return target;
  }

  /**
   * Private method to find where the open spot is. It updates the zeroI and zeroJ attributes of the object.
   */
  private void findGap() {
    this.zeroI = 0;
    this.zeroJ = 0;

    while (board[this.zeroI][this.zeroJ] != 0) {
      this.zeroJ++;
      if (this.zeroJ == size) {
        this.zeroJ = 0;
        this.zeroI++;
      }
    }
  }
}