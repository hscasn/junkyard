#include <iostream>

#include "Maze.h"

using namespace mazeGenerator;

int main () {
  // Starting a 61x61 maze
  Maze maze (61);

  std::cout << maze << std::endl;

  getchar ();
  return 0;
}