#  devChart — Technical Club Collaboration Workspace

**devChart** is a premium, secure, multi-tenant collaboration platform tailored for university and technical clubs. It helps teams organize projects, assign responsibilities, manage membership directories, and track progress using an interactive Kanban board with robust Role-Based Access Control (RBAC).

---

##  Key Features

- **1. Multi-Tenant Club Workspaces**: Create, rename, and toggle between separate club instances (e.g., `"Android Club"`, `"CodeChef Club"`) seamlessly. 
- **2. Interactive Kanban Board**: Drag-and-drop task management divided into *Todo*, *In Progress*, and *Done* states powered by `@hello-pangea/dnd`.
- **3. Task Detail Slide-over Panel**: Rich side panel providing inline field editing (autosaves on blur), task descriptions, assignees management, interactive comment threads, and detailed activity logs.
- **🛡️ Role-Based Access Control (RBAC)**:
  - **Admin**: Full control over settings, deleting tasks, renaming workspaces, and promoting any member's role.
  - **Lead**: Can create tasks, edit tasks, post comments, and promote/demote members between *Member* and *Visitor* roles.
  - **Member**: Can create tasks, edit tasks, post comments, and drag-and-drop cards.
  - **Visitor**: Read-only access across the board, settings, and members list.
- **🔑 Secure Authentication**: JWT session cookies with a compound schema index enforcing email uniqueness per-workspace (allowing a single email to have separate accounts across different clubs).

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Database**: [MongoDB](https://www.mongodb.com/) & [Mongoose](https://mongoosejs.com/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Drag & Drop**: [@hello-pangea/dnd](https://github.com/hello-pangea/dnd)
- **Authentication**: `jsonwebtoken` & `bcryptjs`
- **Notifications**: `react-hot-toast`

---

## 🚀 Getting Started

### 📋 Prerequisites

Ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [MongoDB](https://www.mongodb.com/try/download/community) (running locally or a cloud-hosted Atlas cluster)

### 📥 1. Installation

Clone the repository and install the project dependencies:

```bash
git clone https://github.com/Unknownx-x1/devChart.git
cd devChart
npm install
```

### 🔑 2. Environment Setup

Create a `.env.local` file in the root of the project:

```env
MONGODB_URI=mongodb://localhost:27017/devChart
JWT_SECRET=your_jwt_secret_key_here
```

> [!NOTE]
> For production deployment or connecting to a remote database (e.g., MongoDB Atlas), replace the `MONGODB_URI` connection string. Remember to percent-encode special characters in your password (e.g., `#` becomes `%23`).

### 📦 3. Seed the Database

Before starting the app, run the admin seed script to create the default admin account and the initial `"Android Club"` workspace:

```bash
node scripts/seedAdmin.js
```

**Default Admin Credentials:**
- **Email**: `sood.shivansh13@gmail.com`
- **Password**: `admin123`
- **Workspace**: `Android Club`

### 💻 4. Run Development Server

Start the Next.js development server locally:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to access the application.

---

## ⚙️ Helper Scripts

The project includes CLI utilities inside the `scripts/` folder to manage the database and test connections:

### 🔑 Reset User Password
Resets any user's password in the database.
```bash
node scripts/resetPassword.js <email> <newPassword> "[workspace]"
```
*Example:*
```bash
node scripts/resetPassword.js maxverstappennnn@gmail.com admin123 "Android Club"
```

### 🔍 Database Inspector / Diagnostics
Prints lists of registered workspaces, active members, and user documents from your configured database.
```bash
node scripts/testQuery.js
```

---

## ☁️ Deployment on Vercel

1. Push your fork to GitHub.
2. Import the project in the [Vercel Dashboard](https://vercel.com/new).
3. Set the following **Environment Variables** in Vercel:
   - `MONGODB_URI`: Your MongoDB Atlas URI.
   - `JWT_SECRET`: A secure random string for signing cookies.
4. Click **Deploy**. Vercel will build the serverless lambdas and host the application.
