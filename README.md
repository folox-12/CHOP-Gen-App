# Private Security Company Document Generator
This is a desktop application built with Tauri and React for generating HR-related documents for private security companies (ЧОП). It streamlines the process of creating standardized paperwork by using employee data from an Excel file and pre-defined document templates.
## ✨ Features

*   **Multi-Organization Management**: Easily switch between different company profiles
*   **Excel Data Import**: Load employee data directly from `.xlsx` files.
*   **Interactive Employee Table**: View, search, and sort employee data in a clear tabular format.
*   **Batch Document Generation**: Select multiple employees and generate documents for all of them at once.
*   **Template-Based Generation**: Uses `.docx` templates to create various documents, including:
    *   Application for a personal card (Заявление на получение личной карточки)
    *   Employment notification (Уведомление при приеме на работу)
    *   Dismissal notification (Уведомление об увольнении)
    *   And more...
*   **Direct to Desktop**: Generated documents are automatically saved to the user's desktop for easy access.
*   **Persistent State**: Your data and settings are saved between sessions.

## 🛠️ Technology Stack

*   **Desktop Framework**: [Tauri](https://tauri.app/) (with Rust)
*   **Frontend**: [React](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **State Management**: [Zustand](https://github.com/pmndrs/zustand)
*   **Document Processing**: [docxtemplater](https://docxtemplater.com/) for `.docx` generation
*   **Excel Parsing**: [xlsx](https://github.com/SheetJS/sheetjs)

## 🚀 Getting Started

To get a local copy up and running, follow these steps.

### Prerequisites

You need to have Node.js and the Tauri development environment set up on your machine.
*   **Node.js**: [https://nodejs.org/](https://nodejs.org/)
*   **Tauri Prerequisites**: Follow the official guide at [https://tauri.app/v1/guides/getting-started/prerequisites](https://tauri.app/v1/guides/getting-started/prerequisites)

### Installation & Running

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/folox-12/tauri-app.git
    cd tauri-app
    ```

2.  **Install NPM dependencies:**
    ```sh
    npm install
    ```

3.  **Run the application in development mode:**
    This will open the application in a new window with hot-reloading enabled.
    ```sh
    npm run tauri dev
    ```

4.  **Build the application for production:**
    This will create a standalone executable for your platform in `src-tauri/target/release/bundle/`.
    ```sh
    npm run tauri build
    ```

## 📖 Usage

1.  Launch the application.
2.  Use the tabs in the header to select the desired security organization.
3.  Click the **"Обновить"** (Update) button to upload an Excel file containing employee information. The table will be populated with the data.
4.  Use the search bar to filter for specific employees by name.
5.  Select one or more employees using the checkboxes in the table.
6.  Click the **"Сгенерировать документы"** (Generate Documents) button. A modal will appear.
7.  In the modal, click on the desired document type to generate and save it.
8.  The generated `.docx` file will be saved to your desktop.
