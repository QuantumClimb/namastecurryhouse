# Namaste Curry House Website

A modern, responsive website for Namaste Curry House - an authentic Indian restaurant. This website showcases traditional Indian cuisine, cultural hospitality, and the warm dining experience.

## 🚀 Features

- **Responsive Design**: Optimized for all devices
- **Modern UI**: Built with Shadcn/UI components and TailwindCSS
- **Interactive Menu**: Tabbed interface showcasing appetizers, curries, biryanis, and traditional drinks
- **Reservation System**: Easy table booking functionality
- **Gallery**: Visual showcase of the restaurant atmosphere and authentic Indian dishes
- **Contact Integration**: WhatsApp integration for quick communication
- **Authentic Aesthetics**: Traditional Indian design elements with modern touches

## 🛠 Tech Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS with custom animations
- **UI Components**: Shadcn/UI component library
- **Routing**: React Router DOM
- **State Management**: TanStack React Query
- **Icons**: Lucide React

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Setup

1. **Clone the repository**
   ```bash
   git clone <your-git-url>
   cd namaste-curry-house
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

5. **Preview production build**
   ```bash
   npm run preview
   ```

## 📁 Project Structure

```
namaste-curry-house/
├── src/
│   ├── components/
│   │   ├── ui/              # Shadcn/UI components
│   │   ├── Navigation.tsx   # Main navigation
│   │   ├── Footer.tsx       # Footer component
│   │   └── WhatsAppButton.tsx
│   ├── pages/
│   │   ├── Index.tsx        # Home page
│   │   ├── Menu.tsx         # Menu page
│   │   ├── AboutUs.tsx      # About page
│   │   ├── Gallery.tsx      # Gallery page
│   │   ├── Reservation.tsx  # Reservation page
│   │   └── Contact.tsx      # Contact page
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utility functions
│   └── App.tsx              # Main App component
├── public/
│   └── images/              # Static images
└── package.json
```

## 🎨 Customization

### Styling
- Colors and themes can be customized in `tailwind.config.ts`
- Custom CSS effects are defined in `src/index.css`
- Component styling uses TailwindCSS utility classes

### Content
- Menu items can be updated in `src/pages/Menu.tsx`
- Restaurant information is in `src/pages/AboutUs.tsx`
- Contact details are in `src/pages/Contact.tsx`

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically on push

### Netlify
1. Build the project: `npm run build`
2. Upload the `dist` folder to Netlify

### Other Platforms
The project builds to static files in the `dist` directory and can be deployed to any static hosting service.

## 🔧 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📞 Support

For any questions or issues, please contact the development team or create an issue in the repository.

## 📄 License

This project is proprietary and confidential. All rights reserved.
