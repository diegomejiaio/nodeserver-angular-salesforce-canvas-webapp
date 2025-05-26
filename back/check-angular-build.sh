#!/bin/sh
# This script checks if the Angular dist files exist and builds them if needed

ANGULAR_DIST_PATH="../front/dist/front/browser"

# Check if the Angular dist directory exists
if [ ! -d "$ANGULAR_DIST_PATH" ]; then
  echo "Angular dist files not found at $ANGULAR_DIST_PATH"
  echo "Would you like to build the Angular app? (y/n)"
  read answer
  
  if [ "$answer" = "y" ] || [ "$answer" = "Y" ]; then
    echo "Building Angular app..."
    cd ../front
    npm install
    npm run build
    cd ../back
    echo "Angular build completed!"
  else
    echo "You will need to build the Angular app before running the server."
    echo "You can do this by running 'cd ../front && npm run build' from the back directory."
  fi
else
  echo "Angular dist files found at $ANGULAR_DIST_PATH"
fi
