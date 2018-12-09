# PathFinder
A program that finds the shortest paths through boards/mazes. The walls are easily customizable, so the board can take any shape you want. You can also configure it to use diagonal routes or only vertical and horizontal. It is also compatible with my Maze Generator (Java) - you MUST download the package if you intend to run the sample: download the package and place it in the same folder you put this package (both packages should be in the same folder).

The old version of this script was made in C++. This time, I rewrote it completely and made it much faster: it now uses the A* algorithm to find the shortes path, using a priority queue to find the most suitable cells to visit, and also uses a binary search tree to store the visited links.


HENRIQUE SALVADORI COELHO - henriquesc@gmail.com - hcoelho.com

The file MazeToBoard is optional, use it only if you intend to use the Maze Generator with this algorithm.
The Main file contains some samples.
The other 3 files (Board, Mark, and PathFinder) are required.
