# Project 13 - Sender File Sharing Platform

## Recent Updates

### 🚀 New Global Navigation System
- **Consistent Navigation**: All pages now have the same navigation bar
- **Mobile-First Design**: Fully responsive navigation that works great on all devices
- **Smart Authentication**: Navigation automatically shows login/register or user actions based on authentication status
- **Admin Support**: Admin users automatically see the admin link in navigation

### 📱 Mobile Improvements
- **Touch-Friendly**: All buttons and interactive elements are optimized for touch devices
- **Responsive Layout**: Grid layouts automatically adjust for different screen sizes
- **Mobile Menu**: Hamburger menu for mobile devices with smooth animations
- **Better Typography**: Text sizes and spacing optimized for mobile reading
- **Form Improvements**: Input fields prevent zoom on iOS and have better touch targets

### 🔧 Technical Features
- **Sticky Navigation**: Navigation stays at the top when scrolling
- **Smooth Transitions**: All navigation interactions have smooth animations
- **Active State**: Current page is clearly highlighted in navigation
- **Accessibility**: Proper focus states and keyboard navigation support

## File Structure

```
project13/
├── index.html          # Home page
├── dashboard.html      # User dashboard
├── admin.html         # Admin panel
├── upload.html        # File upload
├── packages.html      # Package management
├── retrieve.html      # File retrieval
├── dirviewer.html     # Directory viewer
├── nav.js            # Global navigation system
├── styles.css        # Enhanced mobile-friendly styles
├── app.js            # Main application logic
├── auth.js           # Authentication system
└── README.md         # This file
```

## Navigation Features

### Desktop Navigation
- Logo and branding on the left
- Navigation links in the center
- Authentication buttons on the right

### Mobile Navigation
- Logo and hamburger menu button
- Collapsible navigation menu
- Full-width navigation links
- Touch-optimized interactions

### Authentication States
- **Unauthenticated**: Shows login/register buttons
- **Authenticated**: Shows user info and logout button
- **Admin**: Shows admin link in navigation

## Mobile Breakpoints

- **Desktop**: 1024px and above
- **Tablet**: 768px - 1023px
- **Mobile**: 480px - 767px
- **Small Mobile**: Below 480px

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers (iOS Safari, Chrome Mobile)

## Usage

1. **Navigation**: Use the global navigation bar to move between pages
2. **Mobile**: Tap the hamburger menu to access navigation on mobile devices
3. **Authentication**: Login/register buttons appear when not authenticated
4. **Admin**: Admin users automatically see the admin panel link

## Development

The navigation system is built with vanilla JavaScript and CSS, making it lightweight and fast. The `nav.js` file automatically inserts the navigation into all pages and handles mobile menu functionality.

## Mobile Optimizations

- Touch targets are at least 44px high
- Forms prevent zoom on iOS
- Smooth scrolling and animations
- Responsive grid layouts
- Mobile-first CSS approach
- Touch-friendly button states
