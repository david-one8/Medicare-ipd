# Medicare IPD - Inpatient Department Management System

A modern, responsive web application for managing inpatient department operations including wards, beds, and bed types. Built with React, Vite, and Tailwind CSS for a seamless user experience.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [Architecture](#architecture)
- [Authentication](#authentication)
- [Error Handling](#error-handling)
- [Development](#development)
- [Build & Deployment](#build--deployment)
- [Code Quality](#code-quality)
- [Contributing](#contributing)
- [License](#license)

## Overview

Medicare IPD is a specialized management application designed for healthcare facilities to efficiently manage inpatient department operations. The system provides intuitive interfaces for managing wards, beds, and bed types with a robust authentication system and responsive design.

## Features

- **Ward Management**: Create, read, update, and delete ward information
- **Bed Management**: Manage bed allocation and status across different wards
- **Bed Type Management**: Configure and maintain different bed type categories
- **User Authentication**: Secure login with token-based authentication
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Protected Routes**: Secure pages with automatic redirect to login
- **Error Handling**: Comprehensive error handling and user-friendly error messages
- **Pagination**: Efficient data display with pagination support
- **Real-time Navigation**: Dynamic navigation with React Router v7

## Tech Stack

### Core Framework
- **React** `^19.2.5` - UI library
- **React DOM** `^19.2.5` - React rendering
- **React Router DOM** `^7.14.2` - Client-side routing

### Styling & UI
- **Tailwind CSS** `^3.4.19` - Utility-first CSS framework
- **PostCSS** `^8.5.14` - CSS transformation
- **Autoprefixer** `^10.5.0` - Vendor prefix support
- **Boneyard JS** `^1.8.1` - UI component library

### API & HTTP
- **Axios** `^1.16.0` - Promise-based HTTP client

### Build Tools
- **Vite** `^8.0.10` - Next-generation frontend tooling
- **@vitejs/plugin-react** `^6.0.1` - React plugin for Vite

### Development & Quality
- **ESLint** `^10.2.1` - Code linting
- **@eslint/js** `^10.0.1` - ESLint configuration
- **eslint-plugin-react-hooks** `^7.1.1` - React Hooks linting
- **eslint-plugin-react-refresh** `^0.5.2` - React Refresh plugin

## Prerequisites

- **Node.js** - Version 16 or higher
- **npm** - Version 8 or higher (or yarn, pnpm)
- **Git** - For version control
- **Modern Browser** - Chrome, Firefox, Safari, or Edge

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd medicare-ipd
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Configure the following variables in `.env.local`:
   ```env
   VITE_API_BASE_URL=http://your-api-url
   VITE_API_KEY=your-api-key
   ```

## Configuration

### Environment Variables

Create a `.env.local` file in the root directory with the following configuration:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api
VITE_API_KEY=your-api-key-here
```

### Tailwind CSS Configuration

Tailwind CSS is pre-configured in `tailwind.config.js`. Customize theme colors, fonts, and other design tokens as needed.

### PostCSS Configuration

PostCSS configuration is available in `postcss.config.js` with Tailwind CSS and Autoprefixer plugins.

## Usage

### Starting Development Server

```bash
npm run dev
```

The application will start at `http://localhost:5173` with Hot Module Replacement (HMR) enabled.

### Building for Production

```bash
npm run build
```

Optimized build artifacts will be generated in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

Preview the production build locally for testing.

### Linting Code

```bash
npm run lint
```

Run ESLint to check code quality and identify potential issues.

## Project Structure

```
medicare-ipd/
├── public/                 # Static assets
├── src/
│   ├── assets/            # Images, fonts, and other assets
│   ├── components/        # Reusable UI components
│   │   ├── BoneyardLoaders.jsx
│   │   └── PaginationBar.jsx
│   ├── context/           # React Context for state management
│   │   ├── AuthContext.jsx
│   │   ├── AuthContextValue.js
│   │   └── useAuth.js
│   ├── pages/             # Page components
│   │   ├── Login.jsx
│   │   ├── bed/
│   │   │   ├── BedForm.jsx
│   │   │   └── BedList.jsx
│   │   ├── bedType/
│   │   │   ├── BedTypeForm.jsx
│   │   │   └── BedTypeList.jsx
│   │   └── ward/
│   │       ├── WardForm.jsx
│   │       └── WardList.jsx
│   ├── services/          # API service layer
│   │   └── api.js
│   ├── utils/             # Utility functions
│   │   └── errorHandling.js
│   ├── App.jsx            # Main application component
│   ├── index.css          # Global styles
│   └── main.jsx           # Application entry point
├── eslint.config.js       # ESLint configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── postcss.config.js      # PostCSS configuration
├── vite.config.js         # Vite configuration
├── package.json           # Project dependencies
└── README.md              # This file
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Build optimized production bundle |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint to check code quality |

## Architecture

### Component Architecture

The application follows a modular component-based architecture:

- **Pages** - Full-page components for different routes (Login, Ward, Bed, BedType)
- **Components** - Reusable UI components (Loaders, Pagination)
- **Context** - Global state management (Authentication)
- **Services** - API integration layer (API calls)
- **Utils** - Helper functions and utilities (Error handling)

### Data Flow

```
User Interface (Pages/Components)
    ↓
Context (State Management)
    ↓
Services (API Layer)
    ↓
Backend API
```

## Authentication

The application uses token-based authentication with the following flow:

1. **Login** - User enters credentials on the Login page
2. **Token Generation** - Backend validates and returns a bearer token
3. **Token Storage** - Token is stored in localStorage
4. **Protected Routes** - Routes check for token existence before rendering
5. **API Requests** - Token is included in Authorization header
6. **Logout** - Token is removed from localStorage and state

### Auth Context Usage

```jsx
import { useAuth } from './context/useAuth';

function MyComponent() {
  const { token, login, logout } = useAuth();
  
  // Use token, login, logout methods
}
```

### Protected Routes

Routes are protected using the `ProtectedRoute` wrapper in `App.jsx`:

```jsx
<ProtectedRoute>
  <WardList />
</ProtectedRoute>
```

## Error Handling

The application includes comprehensive error handling through the `errorHandling.js` utility:

- **Request Errors** - Network and timeout errors
- **Response Errors** - Server-side validation and business logic errors
- **User Feedback** - Clear, actionable error messages
- **Logging** - Console logging for debugging

### API Error Handling

```javascript
import { getRequestErrorMessage, getResponseErrorMessage } from '../utils/errorHandling';

try {
  const response = await api.get('/data');
} catch (error) {
  const message = getResponseErrorMessage(error) || getRequestErrorMessage(error);
  console.error(message);
}
```

## Development

### Code Style

- Follow existing code patterns and conventions
- Use meaningful variable and function names
- Keep components focused and single-responsibility
- Comment complex logic and business rules

### Creating New Components

1. Create component file in appropriate directory
2. Use functional components with hooks
3. Import and export properly
4. Follow naming conventions (PascalCase for components)
5. Add PropTypes or TypeScript for type safety

### Creating New Routes

1. Create page component in `pages` directory
2. Add route definition in `App.jsx`
3. Implement protected route wrapper if needed
4. Update navigation links in Layout

## Build & Deployment

### Production Build

```bash
npm run build
```

The build outputs optimized files to the `dist` directory:
- Minified JavaScript
- Optimized CSS with Tailwind purging
- Hashed asset files for cache busting

### Deployment Considerations

- Set appropriate environment variables for production
- Ensure API base URL points to production backend
- Enable HTTPS for secure communication
- Configure CORS if API is on different domain
- Set up error tracking and monitoring
- Configure CDN for static asset delivery

### Deployment Platforms

The application can be deployed to:
- Vercel
- Netlify
- AWS S3 + CloudFront
- Azure Static Web Apps
- GitHub Pages
- Traditional web servers (nginx, Apache)

## Code Quality

### ESLint Configuration

ESLint is configured with React-specific rules and best practices:

```bash
npm run lint
```

Fix linting issues automatically:
```bash
npm run lint -- --fix
```

### Best Practices

- Use functional components and hooks
- Keep components pure and predictable
- Minimize re-renders with proper dependency management
- Use Context API for global state
- Handle errors gracefully
- Write descriptive error messages
- Keep functions small and focused

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Review

- Ensure all tests pass
- Follow code style guidelines
- Update documentation as needed
- Include meaningful commit messages
- Address all review comments

## Troubleshooting

### Common Issues

**1. "VITE_API_BASE_URL is undefined"**
- Ensure `.env.local` file exists with proper configuration
- Restart development server after adding environment variables

**2. "Cannot find module" errors**
- Run `npm install` to ensure all dependencies are installed
- Clear node_modules and reinstall if issues persist

**3. Login not working**
- Verify API base URL is correct
- Check API key in environment variables
- Verify backend API is running and accessible
- Check browser console for error details

**4. Build fails**
- Run `npm run lint` to check for code errors
- Clear node_modules and dist directory: `rm -rf node_modules dist`
- Reinstall dependencies: `npm install`
- Rebuild: `npm run build`

## Performance Optimization

- Lazy load routes with React Router code splitting
- Optimize images and assets
- Use Tailwind CSS purging in production
- Monitor bundle size with Vite analysis
- Implement pagination for large datasets
- Cache API responses where appropriate

## Security Considerations

- Never commit sensitive data (API keys, tokens) to version control
- Use environment variables for configuration
- Validate and sanitize user inputs
- Keep dependencies updated for security patches
- Use HTTPS in production
- Implement proper CORS policies
- Securely store authentication tokens
- Follow OWASP guidelines

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support & Contact

For issues, questions, or suggestions:
- Open an issue on the repository
- Contact the development team
- Check documentation and troubleshooting guide

## Changelog

### Version 0.0.0
- Initial project setup
- Authentication system
- Ward management
- Bed management
- Bed type management
- Responsive UI with Tailwind CSS

---

**Last Updated**: May 2026  
**Maintained By**: Medicare Development Team
