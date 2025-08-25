# Split-Window-MD-and-Terminal

This program aims to provide a learning LMS that makes it easy for participants to learn, especially IT-related topics, and allows them to directly participate in hands-on labs, because this program has been integrated into a VM where we can directly configure and try out the lab in just one window. The program is built with two windows: the left side displays the step-by-step instructions for the lab, while the right side features a terminal directly connected to the provided VM.

Here are the results:

![result](img/img1.png)


# Installation

## 1. Manual
### Prerequisites
- NodeJS version minimal 18

### A. Backend

- Change directory to `backend`
  ```bash
  cd Split-Window-MD-and-Terminal/backend
  ```
- install dependencies npm
  ```bash
  npm install
  ```
- run the program
  ```bash
  npm start
  ```
### B. Frontend

- Change directory to `frontend`
  ```bash
  cd Split-Window-MD-and-Terminal/frontend
  ```
- install dependencies npm
  ```bash
  npm install
  ```
- run build
  ```bash
  npm run build
  ```
- running the program
  ```bash
  npm start
  ```

## 2. Container Docker
### Prerequisites
- Docker
- Docker compose

### Running
- Change directory to `Split-Window-MD-and-Terminal`
  ```bash
  cd Split-Window-MD-and-Terminal/
  ```
- build the image
  ```bash
  docker compose build .
  ```
- run the container
  ```bash
  docker compose up -d
  ```

### Delete the container
- Change directory to `Split-Window-MD-and-Terminal`
  ```bash
  cd Split-Window-MD-and-Terminal/
  ```
- Delete container
  ```bash
  docker compose down --rmi all
  ```

# Reference Idea

- Hand on Lab in [DqLab](https://dqlab.id/)

- Hand on free Labs in [kodeCloud](https://kodekloud.com/)

![](img/kodecloud.png)