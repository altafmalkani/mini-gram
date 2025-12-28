# Mini-Gram

Mini-Gram is a full-stack social media application inspired by Instagram. It features a Flask-based RESTful API and a modern React frontend, supporting user authentication, post sharing, social interactions, and real-time notifications.

## 🚀 Features

- **User Authentication**: Secure JWT-based login and registration with role-based access (User/Admin).
- **Post Management**: Create, view, update, and delete posts with image support.
- **Social Interactions**: Like posts, comment on posts (with replies), and follow/unfollow other users.
- **Real-time Notifications**: Get notified instantly for new followers, likes, and comments.
- **Admin Dashboard**: A dedicated panel for administrators to manage users and content.
- **User Profiles**: Customizable profiles with bios and profile pictures.
- **Responsive Design**: Built with React and Bootstrap for a seamless experience across devices.

## 🛠️ Tech Stack

### Backend
- **Framework**: [Flask](https://flask.palletsprojects.com/)
- **Database**: [SQLite](https://www.sqlite.org/) with [SQLAlchemy](https://www.sqlalchemy.org/)
- **Authentication**: [Flask-JWT-Extended](https://flask-jwt-extended.readthedocs.io/)
- **Validation**: [Marshmallow](https://marshmallow.readthedocs.io/)

### Frontend
- **Library**: [React](https://reactjs.org/)
- **Routing**: [React Router](https://reactrouter.com/)
- **Styling**: [Bootstrap](https://getbootstrap.com/) & [React-Bootstrap](https://react-bootstrap.github.io/)
- **API Client**: [Axios](https://axios-http.com/)
- **Icons**: [React Icons](https://react-icons.github.io/react-icons/)
- **Notifications**: [React-Toastify](https://fkhadra.github.io/react-toastify/)

## 📂 Project Structure

```text
mini-gram/
├── backend/                # Flask API
│   ├── src/                # Source code (models, routes, schemas)
│   ├── app.py              # Entry point
│   ├── create_admin.py     # Admin setup script
│   └── requirements.txt    # Python dependencies
├── frontend/               # React Application
│   ├── src/                # Components, pages, context, api
│   ├── public/             # Static assets
│   └── package.json        # Node dependencies
└── README.md               # Project documentation
```

## 🏁 Getting Started

### Prerequisites
- Python 3.8+
- Node.js & npm

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv .venv
   # Windows
   .\.venv\Scripts\activate
   # Linux/Mac
   source .venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create the admin account (required for admin features):
   ```bash
   python create_admin.py
   ```
5. Start the Flask server:
   ```bash
   python app.py
   ```
   The API will be running at `http://localhost:5000`.

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```
   The application will be available at `http://localhost:3000`.

## 📖 API Documentation
For detailed information about the available API endpoints, please refer to the [backend/API_DOCUMENTATION.md](backend/API_DOCUMENTATION.md) file.

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
