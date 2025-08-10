# Nexus Optimizer Pro

## Overview

Nexus Optimizer Pro is a cross-platform AI-powered gaming optimization application designed to enhance system performance through real-time monitoring, automated tweaks, and intelligent optimization suggestions. The application targets gamers seeking to maximize FPS, reduce latency, and optimize their gaming experience through a sleek, gamer-friendly interface with neon accents and animated components.

The system provides comprehensive system optimization tools including temporary file cleanup, registry tweaks, RAM management, GPU tuning, network optimization, and game-specific optimization profiles. It features an AI-powered chatbot for intelligent optimization suggestions, real-time system monitoring with customizable FPS overlays, and dedicated game-specific optimizers (starting with Fortnite).

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend is built using **React** with **TypeScript** and styled using **Tailwind CSS** with the shadcn/ui component library. The application follows a modern single-page application (SPA) architecture using Vite as the build tool and development server.

**Key Frontend Decisions:**
- **React Query (@tanstack/react-query)** for server state management and caching
- **Wouter** for lightweight client-side routing 
- **Custom theming system** with CSS variables supporting multiple color schemes (green, blue, purple, yellow)
- **Dark mode by default** with gaming-inspired neon aesthetics using Orbitron and Inter fonts
- **Component-based architecture** with reusable UI components following atomic design principles

### Backend Architecture
The backend uses **Express.js** with **TypeScript** running on Node.js, providing a RESTful API architecture with WebSocket support for real-time system monitoring.

**Key Backend Decisions:**
- **Express.js** chosen for its simplicity and extensive ecosystem
- **WebSocket integration** for real-time system stats broadcasting
- **Memory-based storage** as the primary data layer (with database migration path planned)
- **Modular route organization** separating API concerns into dedicated route handlers

### Data Storage Solutions
Currently implements an **in-memory storage solution** using TypeScript classes and Maps for rapid prototyping and development. The system is architected for easy migration to persistent storage.

**Database Schema Design:**
- **Drizzle ORM** with PostgreSQL schema definitions ready for production deployment
- **Three core entities:** SystemStats, GameProfiles, and ChatMessages
- **UUID-based primary keys** for distributed system compatibility
- **Timestamp tracking** for audit trails and historical data analysis

### Authentication and Authorization
Currently operating without authentication to focus on core functionality development. The architecture supports future integration of session-based or JWT-based authentication systems.

### Real-time Communication
**WebSocket implementation** provides bidirectional communication between client and server for:
- Live system performance metrics broadcasting
- Real-time optimization status updates
- AI chatbot message streaming
- Dynamic game profile synchronization

### AI Integration Architecture
Designed for **cloud-based AI service integration** supporting multiple providers (OpenAI GPT, Anthropic Claude) through a unified interface pattern. The chatbot system uses a conversation-based approach with context preservation for personalized optimization recommendations.

## External Dependencies

### Core Runtime Dependencies
- **@neondatabase/serverless** - PostgreSQL database driver for production deployment
- **drizzle-orm** - Type-safe database ORM with PostgreSQL dialect support
- **express** - Web application framework for API server
- **ws** - WebSocket library for real-time communication

### Frontend UI Framework
- **@radix-ui/* components** - Comprehensive accessible component primitives
- **@tanstack/react-query** - Server state management and data fetching
- **tailwindcss** - Utility-first CSS framework for responsive design
- **class-variance-authority** - Type-safe variant API for component styling

### Development and Build Tools
- **vite** - Fast build tool and development server with HMR support
- **tsx** - TypeScript execution environment for development
- **esbuild** - High-performance JavaScript bundler for production builds

### Current Integrations
- **Multi-GPU Support** - NVIDIA and Intel GPU tuning capabilities with vendor-specific optimization panels
- **Intel GPU Tools** - Graphics Command Center, Power Gadget, and Level Zero integration readiness
- **Hardware-Accelerated GPU Scheduling (HAGS)** - Windows registry optimization with safe backup/restore
- **Per-App GPU Preferences** - Windows Graphics Settings integration for game-specific GPU assignment

### Planned Integrations
- **GPU Vendor SDKs** (NVAPI, ADLX, Level Zero) for hardware-level optimization control
- **Cloud AI Services** (OpenAI, Anthropic) for intelligent optimization suggestions  
- **System APIs** for Windows/Mac/Linux system optimization capabilities
- **PostgreSQL** database for production data persistence

The architecture is designed for horizontal scalability with clear separation between presentation, business logic, and data layers, enabling future expansion to support desktop applications through Electron or Tauri frameworks.