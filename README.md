# Toxin Ronin

Toxin Ronin is a game where one embarks on a journey with a night Miyamoto Musashi to achieve the presented challenges and medicine needed by Musashi. The game offers an immersive experience through both text and speech-based communication between players and the game.
## Technology stack
The project is built using the following technologies:
**Frontend**: React with Vite - Chosen for its fast development experience and optimal performance through features like Hot Module Replacement (HMR) and optimized builds.
**Backend**: Express.js - Selected for its robust features, middleware support, and excellent integration with MongoDB.
**Database**: MongoDB - Utilized for its flexibility with JSON-like documents and excellent scalability.
## Getting started
### Prerequisites
To get started, ensure you the following 
- Nodejs installed in your device ( Version v20.12.2 or later).
- Have an account of atlas mongo and or mongodb compass already installed in your device. To create an atlas account click [here](https://www.mongodb.com/cloud/atlas/register)
- vs code or anyother text editor of your choice.To download vscode [click](https://code.visualstudio.com/download) 
-- Npm installed to your device (Version 10.5.0 or later)
### Installation and setup
For development purposes, follow the steps below to clone and run the toxin game 
1. clone the repository
The bash below would clone your repository when you paste it in gitbash in your device
```
git clone https://git.cardiff.ac.uk/c22065407/group-8-cflt.git
```
2. Installing dependencies 
The project uses node and npm to both setup and run.
To install the dependencies on write 
``` 
npm install 
``` 
which will install all your needed dependencies both on the front end and the backend

3. Configure enviromental variables.
The mongo db url will be provided as part of the server
you can change your port in the server which will be used in your deployment but in our case, the dev server uses 'http://localhost:4173.' while the production server uses 'http://localhost:5173'
### Running the application
To run the application, run npm run dev for your development server 
```
npm run dev
```
or npm run prod for your production server
```
npm run prod 
```
## Key Assumptions and Design principles
1. **Speech Recognition:** The game assumes users have a working microphone and modern browser supporting Web Speech API.
2. **Browser Support:**  Targets modern browsers (Chrome, Firefox, Safari, Edge).
3. **Internet Connection:**  Requires stable internet connection for MongoDB Atlas access.
## Requirements
The game implements the following core requirements:
1.**User Interface**
- Text-based interaction system
- Speech recognition integration
- Responsive design for various screen sizes
## Technologies and Dependencies
### Frontend
- [React](https://react.dev/)
- [RectVite](https://vite.dev/)
- [Boorstrap](https://getbootstrap.com/)
- [React Router](https://reactrouter.com/)
### Backend
- [Expressjs](https://expressjs.com/)- web application framework
- [MongoDB](https://www.mongodb.com/) - Nosql database
- [Mongoose](https://mongoosejs.com/) - MongoDB Modeling tool
## contributing

To contribute to the following project, you can do the following

1. Fork the project
2. git clone the project into your device
3. Create your branch 
```
git checkout -b feature/AmazingFeature
```
4.Add and commit your changes
```
git add .
git commit -m "added feature"
```
5 push your changes and finaly create a merge request
```
git push
```
## License
This project is part of the cardiff course work assignments and is licensed under the university

## Project status

current version 1.0.0
Last updated 09th. January 2025

## Contact

For any queries , please contact the group memebers involved in the making of the project 

### wiki
below is our git [wiki](https://git.cardiff.ac.uk/c22065407/group-8-cflt/-/wikis/home) for any enquires about the project