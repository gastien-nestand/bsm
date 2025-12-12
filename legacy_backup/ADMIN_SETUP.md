# Admin Setup Instructions

## How to Set Up Admin Access

The admin panel is protected and only accessible to users with the `admin` role. Here's how to set up your first admin user:

### Method 1: Using the Database UI (Recommended)

1. Click on the **Database** panel in the Management UI (right sidebar)
2. Navigate to the `users` table
3. Find your user account (you need to log in at least once first)
4. Edit your user record and change the `role` field from `user` to `admin`
5. Save the changes
6. Refresh the website and navigate to `/admin`

### Method 2: Using SQL Query

1. Open the Management UI and go to Settings → Database
2. Run this SQL query (replace `YOUR_OPEN_ID` with your actual openId):

```sql
UPDATE users SET role = 'admin' WHERE openId = 'YOUR_OPEN_ID';
```

### Finding Your OpenId

1. Log in to the website
2. Open browser developer tools (F12)
3. Go to Console tab
4. Type: `fetch('/api/trpc/auth.me').then(r => r.json()).then(console.log)`
5. Look for the `openId` field in the response

## Security Features

- **Frontend Protection**: Admin pages check authentication and role before rendering
- **Backend Protection**: All admin API endpoints verify user role and throw FORBIDDEN errors for non-admins
- **Automatic Owner Admin**: The project owner (defined in environment variables) is automatically assigned admin role on first login

## Admin Features

Once you have admin access, you can:

- **Manage Products**: Add, edit, delete, and toggle availability of bakery products
- **Manage Orders**: View all customer orders and update their status (pending, confirmed, ready, completed, cancelled)
- **View Customer Information**: Access customer contact details and order history

## Customer Access

Regular customers (users with `user` role) can:
- Browse products
- Add items to cart
- Place pre-orders
- View order confirmation

They **cannot** access the admin panel - they will see an "Access Denied" message if they try.
