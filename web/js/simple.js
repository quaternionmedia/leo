var path;

// Only execute onMouseDrag when the mouse
// has moved at least 10 points:
tool.minDistance = 1;

tool.onMouseDown = function(event) {
    // Create a new path every time the mouse is clicked
    path = new Path();
    path.add(event.point);
    path.strokeColor = 'black';
}

tool.onMouseDrag = function(event) {
    // Add a point to the path every time the mouse is dragged
    path.add(event.point);
}