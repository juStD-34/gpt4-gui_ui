# GPT4GUI

AI-based GUI test script generation for Web applications

## Project Overview

GPT4GUI is a web application designed to facilitate AI-driven GUI test script generation for web applications. The project provides a user-friendly interface for managing test environments, creating test cases, and generating test scripts using both traditional methods and AI-based approaches.

## Architecture and Code Organization

The project follows a React-based frontend architecture with the following structure:

### Frontend Structure

```
frontend/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── ImageViewer/   # Components for viewing and managing images
│   │   ├── Menu/          # Application menu components
│   │   ├── MenuModal/     # Modal dialogs for menu actions
│   │   ├── Sidebar/       # Sidebar navigation components
│   │   ├── TestCase/      # Test case related components
│   │   └── Training/      # Training-related components
│   ├── views/             # Main page components
│   │   ├── Home.tsx       # Home page
│   │   ├── OpenEnv.tsx    # Environment viewer
│   │   ├── JavaEditor.tsx # Selenium code editor
│   │   └── TrainModal.tsx # Model training interface
│   ├── routes/            # Application routing
│   ├── utils/             # Utility functions
│   │   ├── api.ts         # API client functions
│   │   └── firebaseConfig.ts # Firebase integration
│   ├── types/             # TypeScript type definitions
│   ├── const.ts           # Application constants
│   ├── App.tsx            # Main application component
│   └── main.tsx           # Application entry point
```

### Architecture

The application follows a component-based architecture with the following key aspects:

1. **Component Hierarchy**:
   - `App.tsx` serves as the main container
   - Layout is managed through Ant Design's Layout components
   - Content is rendered through React Router's routing system

2. **State Management**:
   - React's useState and useContext hooks for local and shared state
   - Context API for sharing state between related components (e.g., ModalContext)

3. **API Communication**:
   - Centralized API endpoints defined in `const.ts`
   - API functions organized in the `utils/api.ts` file
   - Fetch API for HTTP requests

4. **Routing**:
   - React Router for client-side routing
   - Routes defined in `routes/routes.tsx`

5. **UI Components**:
   - Ant Design as the primary UI framework
   - Custom components built on top of Ant Design

## Features

- Create and manage test environments
- Import test specifications from Excel files
- Manage test cases and images
- Generate test scripts using AI-based approaches
- View and edit Selenium code
- Train custom models for test script generation
- Real-time training monitoring

## Installation

### Prerequisites

- Node.js (v16 or newer)
- npm or yarn
- Backend services set up (see Backend Setup)

### Frontend Setup

1. Clone the repository:
```bash
git clone https://github.com/your-username/gpt4-gui_ui.git
cd gpt4-gui_ui/frontend
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Configure environment variables:
Create a `.env` file in the frontend directory with the following variables:
```
VITE_API_HOST=http://localhost:8080
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

5. The application will be available at `http://localhost:5173`

### Backend Setup

The frontend communicates with a backend server that should be set up separately. The backend API endpoints are defined in `src/const.ts`.

1. Clone the backend repository (if available separately)
2. Follow the backend-specific installation instructions
3. Ensure the backend is running on the port specified in your `.env` file

### Firebase Configuration

The application uses Firebase for image storage. Configure Firebase by updating the `src/utils/firebaseConfig.ts` file with your Firebase project details.

## Development

### Adding New Features

1. Create new components in the appropriate directories
2. Update routes if necessary
3. Add API endpoints to `const.ts` and corresponding functions to `utils/api.ts`

### Building for Production

```bash
npm run build
# or
yarn build
```

The built files will be available in the `dist` directory.

## Libraries and Dependencies

### Core Libraries

- [React](https://reactjs.org/) - Frontend library for building user interfaces
- [TypeScript](https://www.typescriptlang.org/) - Typed JavaScript
- [Vite](https://vitejs.dev/) - Build tool and development server

### UI Framework

- [Ant Design](https://ant.design/) - UI component library
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework

### Routing

- [React Router](https://reactrouter.com/) - Client-side routing

### Code Editing

- [CodeMirror](https://codemirror.net/) - Code editor for browser
- [@uiw/react-codemirror](https://github.com/uiwjs/react-codemirror) - React wrapper for CodeMirror

### Data Visualization

- [Recharts](https://recharts.org/) - Charting library built on React components

### Icons and Styling

- [Font Awesome](https://fontawesome.com/) - Icon library
- [Ant Design Icons](https://ant.design/components/icon/) - Ant Design icons

### File Handling

- [Firebase Storage](https://firebase.google.com/docs/storage) - Cloud storage for images
- [SheetJS](https://sheetjs.com/) - Excel file handling

### Other Utilities

- [Papaparse](https://www.papaparse.com/) - CSV parsing
- [Lodash](https://lodash.com/) - Utility library

## License

[MIT License](LICENSE)

## Acknowledgements

- [Ant Design](https://ant.design/) for the UI components
- [React](https://reactjs.org/) and the React community
- All contributors to the libraries used in this project