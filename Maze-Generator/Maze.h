#ifndef MAZEGENERATOR_BOARD_H
#define MAZEGENERATOR_BOARD_H

#define BOARD_WALL   '#'
#define BOARD_EMPTY  ' '
#define BOARD_START  ' '
#define BOARD_FINISH ' '

namespace mazeGenerator {
  class Maze {
  private:

    struct BoardLink {
      int c1;
      int c2;

      BoardLink () {}
      BoardLink (int cell1, int cell2) {
        c1 = cell1;
        c2 = cell2;
      }
    };

    // _size and _totalSize hold the size of the board: size is the width /height,
    // totalSize is width x height. Only size must be set, totalSize is set by the
    // private method init
    int _size;
    int _totalSize;

    // Holds the number of links created
    int _numberLinks;

    // Holds the board's cells
    char* _board;

    // Holds the links between cells (two cells can be parents, but cannot be crossed)
    BoardLink* _link;

    // Initiates the attributes for the class
    void init (int size);
    int getRandomWallParent (int cell, bool acceptFinish);
    int* getValidParents (int cell);
    int getRow (int cell);
    int getCol (int cell);
    int getCellWithWallParent (bool acceptFinish);
    void pushLink (int cell1, int cell2);
    bool hasLink (int cell1, int cell2);
    void create ();

  public:
    // Constructor
    Maze (int size);
    ~Maze ();

    std::ostream& display (std::ostream& out);
  };

  // The operator << sends the board to the ostream
  std::ostream& operator << (std::ostream& out, Maze& board);
}

#endif