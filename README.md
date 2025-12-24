# VisaFreeList AI 🌍✈️

> **Decode Global Mobility v2.0**  
> An intelligent, cyberpunk-themed visa requirement checker and passport comparison tool powered by Google Gemini AI.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/react-18.x-cyan.svg)
![Gemini](https://img.shields.io/badge/AI-Gemini_3_Flash-purple.svg)

## 📖 Overview

VisaFreeList AI is a modern web application designed to simplify global travel logic. Unlike traditional static lists, this app leverages **Google's Gemini 3 Flash & Pro models** to provide real-time, context-aware visa data, parsing complex immigration rules into a streamlined, terminal-style interface.

## ✨ Key Features

*   **Cyberpunk Terminal UI**: Immersive, responsive design with glitch effects, scanlines, and neon aesthetics.
*   **AI-Powered Analysis**: Uses Gemini 3 Flash for rapid list generation and Gemini 3 Pro with **Google Search Grounding** for accurate, up-to-date detailed entry requirements.
*   **Passport Comparison Engine**: Visually compare the power of two passports against 15 diverse destinations side-by-side.
*   **Visual Connectivity**: Graph-based visualization of travel corridors (Source Node -> Target Node).
*   **Global Coverage**: Database supports all major passports and destinations via ISO standards.

## 🛠️ Tech Stack

*   **Frontend**: React 18, TypeScript, Tailwind CSS
*   **AI Integration**: @google/genai SDK
*   **Visualization**: D3.js (World Map), Lucide React (Icons)
*   **Build Tool**: Vite
*   **Deployment**: Nginx / Static Hosting

## 🚀 Local Development

### Prerequisites

*   Node.js (v18 or higher)
*   Google Gemini API Key

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/uschan/visa-free-ai.git
    cd visa-free-ai
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment**
    Create a `.env` file in the root directory:
    ```env
    API_KEY=your_google_gemini_api_key_here
    ```

4.  **Start Dev Server**
    ```bash
    npm run dev
    ```

## 📦 Production Build

To create an optimized static build:

```bash
npm run build
```

The output will be in the `dist/` directory, ready to be served by Nginx, Vercel, or Netlify.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---
*Built by [WildSalt](https://wildsalt.me) // System Ready*
