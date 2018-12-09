#include <iostream>
#include <string>

#include <cstdlib>
#include <ctime>

#include "Maze.h"

namespace mazeGenerator {

  using std::string;

  //===========================================================================
  // Constructor
  //
  // Receives an integer with the width/height of the board and initializes
  // the object
  //===========================================================================
  Maze::Maze (int size) {
    std::srand ((unsigned int) std::time (NULL));

    init (size);
  }


  //===========================================================================
  // Destructor
  //===========================================================================
  Maze::~Maze () {
    delete [] _link;
    delete [] _board;
  }


  //===========================================================================
  // init
  // 
  // This method initializes the attributes for the class, receives the width
  // of the board and sets its total size
  //===========================================================================
  void Maze::init (int size) {
    if (size > 101 || size < 7 || size % 2 == 0) {
      std::cerr << "Board size not correctly set. It must be an odd number between 7 and 101." << std::endl;
    } else {
      _numberLinks = 0;
      _size = (size - 1) / 2;
      _totalSize = _size * _size;

      // Initializing the board
      _board = new char [_totalSize];

      // Filling the board with walls
      for (int i = 0; i < _totalSize; _board [i] = BOARD_WALL, i++);

      // Placing the starting point
      _board [0] = BOARD_START;

      // Placing the finish point
      _board [_totalSize - 1] = BOARD_FINISH;

      create ();
    }
  }


  //===========================================================================
  // create
  // 
  // Creates the maze
  //===========================================================================
  void Maze::create () {
    bool foundFinish = false;

    // Looping while there still are breakable walls in the maze
    do {

      bool hasAvailableCell;
      int currentCell = getCellWithWallParent (!foundFinish);

      // Looping to expand the path until it cannot be expanded anymore
      do {
        int selectedCell = getRandomWallParent (currentCell, !foundFinish);

        // If there is an available cell next to the current one, jumps to it
        if (hasAvailableCell = selectedCell > -1) {

          // If it reached the finish, stops this path and starts a new one
          if (selectedCell == _totalSize - 1) {
            foundFinish = true;
            hasAvailableCell = false;
          } else {
            _board [selectedCell] = BOARD_EMPTY;
          }

          pushLink (currentCell, selectedCell);

          currentCell = selectedCell;
        }

      } while (hasAvailableCell);

    } while (getCellWithWallParent (!foundFinish) > -1);
  }


  //===========================================================================
  // pushLink
  // 
  // Creates a link between 2 cells and pushes it in the array of links
  //===========================================================================
  void Maze::pushLink (int cell1, int cell2) {
    BoardLink newLink (cell1, cell2);

    // Craeting a new link bundle
    BoardLink* newBundle = new BoardLink [_numberLinks + 1];

    // Copying the previous links to the new bundle
    for (int i = 0; i < _numberLinks; newBundle [i] = _link [i], i++);

    // Adding the new link
    newBundle [_numberLinks] = newLink;

    // Replacing the previous bundle
    delete [] _link;
    _link = newBundle;

    _numberLinks++;
  }


  //===========================================================================
  // hasLink
  // 
  // Creates a link between 2 cells and pushes it in the array of links
  //===========================================================================
  bool Maze::hasLink (int cell1, int cell2) {
    bool hasLink = false;

    // Looping through the bundle looking for the link
    for (int i = 0; i < _numberLinks && !hasLink; i++) {
      bool condition1 = _link [i].c1 == cell1 && _link [i].c2 == cell2;
      bool condition2 = _link [i].c1 == cell2 && _link [i].c2 == cell1;

      if (condition1 || condition2) hasLink = true;
    }

    return hasLink;
  }


  //===========================================================================
  // getCellWithWallParent
  // 
  // Loops through the board and returns the first cell with valid wall parents
  // that it finds. If it doesn't find anything, returns -1
  //===========================================================================
  int Maze::getCellWithWallParent (bool acceptFinish) {
    int foundCell = -1;

    for (int i = 0; i < _totalSize && foundCell < 0; i++) {
      int tmpCell = getRandomWallParent (i, acceptFinish);
      if (tmpCell > -1) {
        foundCell = i;
      }
    }

    return foundCell;
  }


  //===========================================================================
  // getRandomWallParent
  // 
  // Receives a cell and chooses 1 random parent that is a wall
  // to return (only valid wall parents are returned, if there are no valid
  // parents, the function returns -1)
  //===========================================================================
  int Maze::getRandomWallParent (int cell, bool acceptFinish) {
    int* validParents = getValidParents (cell);

    // Counting how many parents are valid, if none of them is valid, returns
    // -1
    int countValidParents = 0;
    for (int i = 0; i < 4; i++) {
      bool allowedParent = _board [validParents [i]] == BOARD_WALL;

      if (acceptFinish) {
        allowedParent = allowedParent ||
          validParents [i] == _totalSize -1;
      }
      

      if (validParents [i] > -1 && allowedParent) {
        countValidParents++;
      }
    }
    if (countValidParents < 1) return -1;

    // Looping until it finds a random parent that is valid
    bool isValidParent = false;
    int selectedNumber = -1;
    do {
      int randomNumber = std::rand () % 4;
      bool allowedParent = _board [validParents [randomNumber]] == BOARD_WALL;

      if (acceptFinish) {
        allowedParent = allowedParent ||
          validParents [randomNumber] == _totalSize - 1;
      }

      isValidParent = (validParents [randomNumber] > -1 && allowedParent);
      if (isValidParent) selectedNumber = validParents [randomNumber];
    } while (!isValidParent);
    
    delete validParents;
    return selectedNumber;
  }


  //===========================================================================
  // getValidParents
  // 
  // Receives a cell and returns an array with 8 elements containing the cell's
  // valid parents. If the parent is not valid, its index will be -1
  //===========================================================================
  int* Maze::getValidParents (int cell) {
    int* parentCells = new int [4];

    int currentRow = getRow (cell);

    // top
    parentCells [0] = cell - _size;

    // right
    parentCells [1] = cell + 1;

    // bottom
    parentCells [2] = cell + _size;

    // left
    parentCells [3] = cell - 1;

    // Checking if the right/left cells are not jumping to another row
    bool overlappingRowRight = getRow (parentCells [1]) != currentRow;
    bool overlappingRowLeft  = getRow (parentCells [3]) != currentRow;

    // Getting only valid parents, the other ones are set to -1
    for (int i = 0; i < 4; i++) {
      if (parentCells [i] < 0 ||
          parentCells [i] >= _totalSize ||
          (overlappingRowRight && i == 1) ||
          (overlappingRowLeft  && i == 3)) {
        parentCells [i] = -1;
      }
    }

    return parentCells;
  }


  //===========================================================================
  // getRow
  // 
  // Receives a cell and returns the index of the row this cell belongs to
  //===========================================================================
  int Maze::getRow (int cell) {
    return cell / _size;
  }


  //===========================================================================
  // getCol
  // 
  // Receives a cell and returns the index of the column this cell belongs to
  //===========================================================================
  int Maze::getCol (int cell) {
    return cell % _size;
  }


  //===========================================================================
  // display
  // 
  // Receives an ostream, records the board in the stream and then returns it.
  // Can be accessed through the operator <<
  //===========================================================================
  std::ostream& Maze::display (std::ostream& out) {
    // Making an exit
    pushLink (_totalSize -1, (_totalSize - 1) + _size);

    // Upper wall
    for (int i = 0; i < (_size * 2) + 1; i++) {
      if (i == 1) {
        out << BOARD_EMPTY;
      } else {
        out << BOARD_WALL;
      }
    }
    out << std::endl;

    // Holds the bottom wall for the rows
    string bottomWall = "";

    for (int i = 0; i < _totalSize; i++) {
      // Printing left border if needed
      if (getCol (i) == 0) {
        out << BOARD_WALL;
        bottomWall += BOARD_WALL;
      }

      // Printing the cell
      out << _board [i];

      // If there is a link between the cells vertically, prints an empty
      // path, otherwise, a wall in the bottom wall
      if (hasLink (i, i + _size)) {
        bottomWall += BOARD_EMPTY;
      } else {
        bottomWall += BOARD_WALL;
      }

      // If there is a link between the cells horizontally, prints an empty
      // path, otherwise, a wall
      if (hasLink (i, i + 1)) {
        out << BOARD_EMPTY;
      } else {
        out << BOARD_WALL;
      }
      bottomWall += BOARD_WALL;

      // Finished printing the line, prints the right wall and the row below
      // with the maze walls
      if (getCol (i) == (_size - 1)) {
        //out << BOARD_WALL << std::endl;
        //bottomWall += BOARD_WALL;

        out << std::endl << bottomWall << std::endl;

        bottomWall = "";
      }
    }

    // Bottom wall
    //for (int i = 0; i < (_size * 2 + 1); out << 'o', i++);
    //out << std::endl;

    return out;
  }


  //===========================================================================
  // <<
  // 
  // Receives an ostream, records the board in the stream and then returns it.
  //===========================================================================
  std::ostream& operator << (std::ostream& out, Maze& board) {
    return board.display (out);
  }
}