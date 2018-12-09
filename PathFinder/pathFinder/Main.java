package pathFinder;

/**
 * Main
 *
 * Sample runs of the Path Finding program
 *
 * @author Henrique Salvadori Coelho - henriquesc@gmail.com - hcoelho.com
 */

public class Main {

  public static void main(String[] arg) {

    // Show path in the solution? If unchecked, the program will only show the solution, not the routes visited
    boolean showVisited = false;

    for (int i = 0; i < 5; i++) { System.out.println(""); }

    //------------------------------------------------------------------------------------------------------------------
    // MAZE 1
    //------------------------------------------------------------------------------------------------------------------

    Board mazeBoard1 = MazeToBoard.convert(new mazeGenerator.Maze(21));

    PathFinder pathFinder1 = new PathFinder(mazeBoard1, showVisited, false);
    System.out.println(pathFinder1);

    for (int i = 0; i < 5; i++) { System.out.println(""); }


    //------------------------------------------------------------------------------------------------------------------
    // MAZE 2
    //------------------------------------------------------------------------------------------------------------------

    Board mazeBoard2 = MazeToBoard.convert(new mazeGenerator.Maze(45));

    PathFinder pathFinder2 = new PathFinder(mazeBoard2, showVisited, false);
    System.out.println(pathFinder2);

    for (int i = 0; i < 5; i++) { System.out.println(""); }


    //------------------------------------------------------------------------------------------------------------------
    // BOARD 1
    //------------------------------------------------------------------------------------------------------------------
    Board board1 = new Board(32, 32, new Mark(3, 0), new Mark(31, 3));

    board1.putObstacleLine(new Mark(5,  0),   4, false);
    board1.putObstacleLine(new Mark(2,  4),   4, true);
    board1.putObstacleLine(new Mark(5,  5),   5, false);
    board1.putObstacleLine(new Mark(5,  11), 21, false);
    board1.putObstacleLine(new Mark(8,  0),   8, false);
    board1.putObstacleLine(new Mark(8,  9),  23, false);
    board1.putObstacleLine(new Mark(10, 2),  30, false);
    board1.putObstacleLine(new Mark(17, 0),  28, false);
    board1.putObstacleLine(new Mark(17, 29),  3, false);
    board1.putObstacleLine(new Mark(18, 23),  8, true);
    board1.putObstacleLine(new Mark(21, 18), 11, true);

    board1.putObstacle(new Mark(10, 0));
    board1.putObstacle(new Mark(0,  4));

    PathFinder pathFinder3 = new PathFinder(board1, showVisited, true);
    System.out.println(pathFinder3);

    for (int i = 0; i < 5; i++) { System.out.println(""); }


    //------------------------------------------------------------------------------------------------------------------
    // BOARD 2
    //------------------------------------------------------------------------------------------------------------------
    Board board2 = new Board(32, 32, new Mark(3, 0), new Mark(31, 3));

    board2.putObstacleLine(new Mark(8, 0),  8, false);
    board2.putObstacleLine(new Mark(8, 9), 23, false);

    PathFinder pathFinder4 = new PathFinder(board2, showVisited, true);
    System.out.println(pathFinder4);

    for (int i = 0; i < 5; i++) { System.out.println(""); }


    //------------------------------------------------------------------------------------------------------------------
    // BOARD 3
    //------------------------------------------------------------------------------------------------------------------
    Board board3 = new Board(32, 32, new Mark(3, 0), new Mark(31, 30));

    board3.putObstacleLine(new Mark(0,  3), 23, true);
    board3.putObstacleLine(new Mark(4,  9), 28, true);
    board3.putObstacleLine(new Mark(0, 16), 28, true);
    board3.putObstacleLine(new Mark(2, 26), 30, true);

    PathFinder pathFinder5 = new PathFinder(board3, showVisited, false);
    System.out.println(pathFinder5);

    for (int i = 0; i < 5; i++) { System.out.println(""); }
  }
}