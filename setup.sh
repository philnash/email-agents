#!/bin/bash
set -e # Exit immediately if any command fails

echo "Installing npm packages..."
npm install

echo "Creating Python virtual environment with UV..."
uv venv

echo "Activating virtual environment..."
source .venv/bin/activate

echo "Installing langflow with UV pip..."
uv pip install langflow

echo "Setup complete! Virtual environment is activated and langflow is installed."
