sketch-instance-mode
==============

P5 sketch in instance mode, so multiple sketches can live in different divs.

A couple things changed here:
- global-mode sketch converted to instance mode (using a specific p5 instance (`p`))
- Added a `createSketch` function to generate new sketches
- createCanvas uses the given div ID in order to get the appropriate width/height from the canvas1 and canvas2 width/height.
