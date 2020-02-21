# simpleOS
Just a very simple operating system in C.

Still a work in progress, I will add more features in the future


Uses an array (in RAM) 10,000x80 characters as a continuous file system.
Commands:
- pin <line index> - Pushes a line into the index specified of the array
- rin <line index> - Reads the line specified from the array
- pinc <line index> - Similar to 'pin', but will keep pushing lines until the sequence .ef is sent
- rinc <line index> - Similar to 'rin', but will keep reading lines until the sequence .ef is found