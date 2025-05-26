#!/bin/bash

# Colors for better output visibility
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}===== Salesforce Canvas Local Development Script =====${NC}"
echo -e "${CYAN}This script will run the app locally without Docker${NC}"

# Check if user wants Docker or local run
echo -e "${YELLOW}Do you want to run with Docker (d) or locally (l)? [l]${NC}"
read -r run_option

if [[ "$run_option" == "d" ]]; then
  for CONTAINER_ID in $CONTAINER_IDS; do
    CONTAINER_NAME=$(docker ps --format '{{.Names}}' --filter id=$CONTAINER_ID)
    echo -e "${YELLOW}⏹️  Stopping container $CONTAINER_NAME (ID: $CONTAINER_ID)...${NC}"
    docker stop $CONTAINER_ID
    echo -e "${GREEN}✅ Container stopped successfully${NC}"
  done
else
  echo -e "${GREEN}✓ No containers running on port 3000${NC}"
fi

# Build the Docker image with no cache
echo -e "${YELLOW}🔨 Building Docker image (with --no-cache)...${NC}"
docker build --no-cache -t canvas-app .

# Check if build was successful
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Docker image built successfully${NC}"
else
  echo -e "${RED}❌ Docker image build failed${NC}"
  exit 1
fi

# Run the new container
echo -e "${YELLOW}🚀 Starting container on port 3000...${NC}"

# Check if .env file exists
if [ ! -f .env ]; then
  echo -e "${RED}⚠️ Warning: .env file not found!${NC}"
  echo -e "${YELLOW}Do you want to continue without the .env file? (y/n)${NC}"
  read answer
  if [ "$answer" != "y" ] && [ "$answer" != "Y" ]; then
    echo -e "${RED}Aborting deployment.${NC}"
    exit 1
  fi
  echo -e "${YELLOW}Starting container without environment variables...${NC}"
  docker run -d -p 3000:80 --name canvas-app-$(date +%s) canvas-app
else
  echo -e "${GREEN}✓ Using environment variables from .env file${NC}"
  docker run -d -p 3000:80 --env-file .env --name canvas-app-$(date +%s) canvas-app
fi

# Check if container started successfully
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Container started successfully${NC}"
  echo -e "${GREEN}🌐 App is now accessible at http://localhost:3000${NC}"
  
  # Get container name
  CONTAINER_NAME=$(docker ps --filter "publish=3000" --format "{{.Names}}" | head -n 1)
  
  echo -e "\n${BLUE}===== Useful Commands =====${NC}"
  echo -e "${CYAN}View logs:${NC} docker logs -f $CONTAINER_NAME"
  echo -e "${CYAN}Stop container:${NC} docker stop $CONTAINER_NAME"
  echo -e "${CYAN}View running containers:${NC} docker ps"
else
  echo -e "${RED}❌ Failed to start container${NC}"
  exit 1
fi

echo -e "${BLUE}===== Running Containers =====${NC}"
docker ps | grep 3000 || echo -e "${YELLOW}No containers found on port 3000!${NC}"

else # Local run option
  echo -e "${BLUE}===== Running Locally =====${NC}"
  
  # Check if the front-end is built
  if [ ! -d "front/dist/front/browser" ]; then
    echo -e "${YELLOW}🔍 Angular build not found. Do you want to build it now? [y/n]${NC}"
    read -r build_front
    
    if [[ "$build_front" == "y" ]]; then
      echo -e "${CYAN}Building Angular frontend...${NC}"
      cd front
      npm install
      npm run build
      cd ..
      echo -e "${GREEN}✅ Angular build completed!${NC}"
    else
      echo -e "${YELLOW}⚠️ Skipping Angular build. Make sure it's built before running the backend.${NC}"
    fi
  else
    echo -e "${GREEN}✅ Angular build found!${NC}"
  fi
  
  # Run the backend
  echo -e "${CYAN}Starting Node.js backend on port 3000...${NC}"
  cd back
  npm run dev
fi
