# intranet.tricel.local_Node.JS
Backend development course

My Backend Project – Malin Häger
Hi! My name is Malin Häger, and I am a first-year IT student at Åland University of Applied Sciences. This repository contains my project for the course "Backend Development" (5 ECTS).

Overview
In this course, we have been learning how to build a functional backend using Node.js and JavaScript. This project is a direct continuation of our previous course, "Frontend Development." My task has been to take the interface we built back then and connect it to a server and a database to create a complete web application.

Since we are in the early stages of our degree, we are using an MS Access database to store data. It’s a great way to learn the basics before we dive deeper into advanced relational database design later in the program. We work in a Windows environment and deploy the final application on an IIS web server.

A Note on Security
For educational purposes, I am using the MD5 algorithm to hash passwords. Our lecturer has explained that this is an intentionally weak algorithm. The goal is for us to understand security vulnerabilities in practice and learn why we should use stronger alternatives like bcrypt or Argon2 in real-world production environments.

Project Structure
Here is an overview of how I have organized my files:
/config – Configuration files for the project.
/data – Various data sources for exercises (JSON, XML, and our MDB database).
/masterframe – Frontend HTML files.
/public – All public assets: CSS, layout images, staff photos, and frontend scripts.
/routes – My route definitions in JavaScript.
/ – Main application files.

Installation & Setup
To get the project running locally on my machine, I follow these steps:
Clone the repository: git clone https://github.com/SabumnimKim/intranet.tricell.local_NodeJS.git
Install all dependencies: npm install

Key Dependencies
Some of the most important modules I'm working with include:
Express & Express-session for the server and session management.
node-adodb to communicate with the Access database.
Pug as the template engine.
Formidable (v. 2.0.1) for file handling (versioning is crucial here!).

Disclaimer
This is a student project created as part of my education. It is designed for learning the fundamentals and should not be used in a production environment, as the security mechanisms have been simplified to support our learning objectives.

Student: Malin Häger
Course: Backend Development (5 ECTS)
Program: IT Program, Åland University of Applied Sciences
Lecturer: Kim Gylling
