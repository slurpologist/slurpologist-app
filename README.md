# Slurp Production Dashboard

![Status](https://img.shields.io/badge/status-active-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Developer](https://img.shields.io/badge/developer-SeccaStudio-%23ff69b4)

## 📘 Overview

**Slurp Production Dashboard** is a modern, real-time **Single Page Application (SPA)** designed to monitor and manage production processes in the food manufacturing industry. Built with a responsive and user-friendly interface, the application integrates seamlessly with **Firebase** for real-time data synchronization and secure user management.

---

## 🚀 Core Features

- **🔐 Authentication & Role-Based Access Control**  
  Secure login system powered by Firebase Authentication with multiple user roles: `admin`, `operator`, and `viewer`.

- **📊 Interactive Dashboard**  
  Visual insights using **Chart.js**, displaying key production metrics (KPI), trends, efficiency levels, and loss tracking.

- **📝 Production Data Input**  
  Structured forms with smart validation for recording production data by shift, variant, and target comparison.

- **🎯 Target Management**  
  Admin users can create and update production targets based on shift, product variant, and specific dates.

- **📋 Recent Production Table**  
  Display of recent production entries with dynamic **search**, **filter**, and **sort** capabilities.

- **👥 User Management**  
  Full CRUD functionality for user accounts, with role-based privileges and permissions.

- **💲 Price & Variant Configuration**  
  Admins can manage product pricing per kilogram and configure available product variants.

- **📤 Data Export**  
  Export production records to **PDF** and **Excel** formats for reporting and archiving.

- **🌙 Modern UI Design**  
  Built using **TailwindCSS**, supporting responsive layouts, **dark mode**, and loading states for better UX.

- **⚡ Firebase Integration**  
  Connected to **Firebase Firestore** and **Auth**, enabling real-time updates and secure data flow.

---

## 🧠 Tech Stack

- **Frontend**: HTML, Vanilla JavaScript, TailwindCSS, Chart.js  
- **Backend**: Firebase (Authentication, Firestore, Hosting)  
- **Exporting Tools**: jsPDF, SheetJS  

---


## 🔒 Security Notes

- Firebase credentials exposed in the frontend are public by design. Ensure **Firestore Rules** are properly set to restrict data access.
- Role-based rules are enforced at both the UI and database levels.

---

## 📌 Roadmap

- [ ] Real-time notifications
- [ ] Activity log & audit trail
- [ ] Multilingual support
- [ ] PWA & offline access support

---

## 🤝 Contributing

Contributions are welcome! Feel free to fork this repository and submit a pull request.  

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for details.

---

## 👨‍💻 Developed by

**SeccaStudio**  
Web Developer | Game Developer | Content Creator  
🌐 [https://seccaprofile.vercel.app](https://seccaprofile.vercel.app)  
📧 seccastudio@gmail.com  
🐙 [@seccastudio](https://github.com/seccastudio)

---

> “Crafted with precision. Designed for performance.”

