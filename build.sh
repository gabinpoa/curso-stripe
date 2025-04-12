#!/bin/bash

# Run the build command
npm run build

# Check if the build was successful
if [ $? -eq 0 ]; then
    echo "Build completed successfully."

    # Copy the static directory to standalone
    cp -r .next/static/ ./.next/standalone/static

    echo "Static files copied successfully."

    # Copy the public directory to standalone
    cp -r ./public/ ./.next/standalone/public

    echo "Public files copied successfully."
else
    echo "Build failed. Please check the errors above."
    exit 1
fi