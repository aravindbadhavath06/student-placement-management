# 🎓 PlacePro — Student Placement Management System

A full-stack **Student Placement Management System** built with **React.js, Spring Boot, and MySQL**.

PlacePro streamlines campus placement activities by providing a centralized platform for managing students, companies, job opportunities, applications, and placement records.

## ✨ Features

### 🔐 Authentication & Authorization
- User registration and login
- JWT-based authentication
- Role-based access control
- Separate access for Admin, Placement Officer, and Student

### 👨‍🎓 Student Portal
- View dashboard statistics
- View student profile
- Browse companies and job opportunities
- Apply for jobs and internships
- Track application status
- View placement information

### 🛠️ Admin Dashboard
- View placement dashboard statistics
- Manage student records
- Manage company information
- Create and manage job opportunities
- View and manage applications
- Manage placement records
- Prevent duplicate placement records for a student

### 🏢 Placement Officer Portal
- View placement statistics
- Access student and company information
- Create job opportunities
- Review applications
- View placement records and statuses

## 🧰 Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React.js, Vite, JavaScript, CSS |
| Backend | Java, Spring Boot, Maven |
| Database | MySQL |
| Authentication | JWT, Spring Security |
| API Communication | REST APIs, Axios |
| Version Control | Git, GitHub |

## 🏗️ Project Structure

```text
student-placement-management/
├── backend/
│   ├── src/
│   │   └── main/
│   │       ├── java/
│   │       └── resources/
│   └── pom.xml
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

## ⚙️ Getting Started

### Prerequisites

Install the following before running the application:

- Java Development Kit (JDK)
- Maven
- Node.js and npm
- MySQL Server

### 1. Clone the Repository

```bash
git clone https://github.com/aravindbadhavath06/student-placement-management.git
cd student-placement-management
```

### 2. Configure the Database

Start MySQL and create the database:

```sql
CREATE DATABASE student_placement_db;
```

Configure the database connection using environment variables or your local Spring Boot configuration.

Example environment variables:

```text
DB_URL=jdbc:mysql://localhost:3306/student_placement_db
DB_USERNAME=root
DB_PASSWORD=your_mysql_password
```

Replace `your_mysql_password` with your local MySQL password. Never commit real passwords or secrets to GitHub.

### 3. Run the Backend

Open a terminal in the project root:

```bash
cd backend
mvn spring-boot:run
```

The backend is configured to run on:

`http://localhost:8080`

API base path:

`http://localhost:8080/api`

### 4. Run the Frontend

Open a **second terminal** in the project root:

```bash
cd frontend
npm install
npm run dev
```

Open the local development URL shown in the terminal. The default Vite URL is usually:

`http://localhost:5173`

Ensure the backend and MySQL server are running before testing the application.

## 🔒 Security Notes

- Authentication is handled through JWT-based security.
- Application access is controlled by user roles.
- Database credentials should be configured securely through environment variables.
- Do not publish passwords, signing secrets, or private credentials.

## 🚀 Future Enhancements

- Resume upload and management
- Email notifications for application updates
- Advanced student and placement analytics
- Search and filtering improvements
- Cloud deployment

## 👨‍💻 Author

**Aravind Badhavath**

Artificial Intelligence Student | Full-Stack Development Enthusiast

GitHub: [aravindbadhavath06](https://github.com/aravindbadhavath06)

## 📄 License

This project is intended for educational and academic purposes. Add a formal open-source license if you decide to distribute it under specific reuse terms.