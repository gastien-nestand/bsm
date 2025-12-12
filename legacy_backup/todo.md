# Project TODO

## Database Schema
- [x] Create products table with fields (name, description, price, category, image, available)
- [x] Create orders table with fields (customer info, order items, status, total, timestamp)
- [x] Create order_items table for order line items

## Backend (tRPC Procedures)
- [x] Product management procedures (list, get by id, create, update, delete)
- [x] Order procedures (create order, list orders, get order by id, update order status)
- [x] Public procedures for viewing products and placing orders

## Frontend UI
- [x] Homepage with hero section and store information
- [x] Products listing page with categories and filtering
- [x] Product detail view
- [x] Shopping cart functionality
- [x] Checkout/pre-order form
- [x] Order confirmation page
- [x] Admin panel for managing products and orders
- [x] Responsive design for mobile and desktop

## Styling & Branding
- [x] Choose color palette reflecting Haitian culture and bakery theme
- [x] Add store logo and branding
- [x] Implement responsive navigation
- [x] Add footer with store location and contact info

## Testing & Deployment
- [x] Test product listing and filtering
- [x] Test order placement flow
- [x] Test admin functionality
- [x] Create checkpoint for deployment

## New Changes Requested
- [x] Update color scheme from blue/orange to white and beige
- [x] Implement proper admin authentication (admin users only)
- [x] Ensure customers cannot access admin panel

## French Translation Feature
- [x] Install i18n library (react-i18next)
- [x] Create translation files (English and French)
- [x] Add language toggle button in navigation
- [x] Translate all pages (Home, Products, Checkout, Admin)
- [x] Persist language preference in localStorage

## New Feature Requests
- [x] Add Haitian Creole (ht) as third language option
- [x] Update language toggle to support three languages (EN/FR/HT)
- [x] Add Drinks as a product category
- [x] Create featured products section on homepage
- [x] Add special/new items showcase on homepage
- [x] Add sample drink products to database

## Mobile & Layout Improvements
- [x] Add collapsible hamburger menu for mobile navigation
- [x] Move New & Special section right after hero section
- [x] Add header image with bread and akasan
- [x] Test mobile responsiveness

## Navbar and Payment Features
- [x] Fix transparent navbar issue
- [x] Add mobile hamburger menu to Products page
- [x] Set up Stripe payment integration
- [x] Implement online card payment in checkout
- [x] Add payment option selection (pay online vs pay at pickup)
- [x] Test payment flow

## Bug Fixes
- [x] Fix tRPC error returning HTML instead of JSON
- [x] Investigate server-side error causing invalid response

## Navbar Updates
- [x] Replace "Boulangerie Saint Marc" text with logo placeholder image
- [x] Add language toggle button to mobile navigation
- [x] Update all pages (Home, Products, Checkout, Admin) with new navbar

## Accessibility Fixes
- [x] Add DialogTitle to MobileNav Sheet component
- [x] Verify all Sheet/Dialog components have proper titles

## Additional Accessibility Fix
- [x] Fix shopping cart Sheet component DialogTitle warning
