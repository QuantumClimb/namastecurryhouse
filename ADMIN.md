# ADMIN.md

## Admin Section & Food Item Image Management Blueprint

---

### 1. **Admin Section**

#### **Features**
- `/admin` route and page
- Simple login form (username & password)
- Hardcoded credentials:
  - Username: `NamasteAdmin`
  - Password: `namaste123`
- Local login state (Zustand or localStorage)
- Basic admin dashboard (placeholder for future features)

#### **Frontend Example**

```tsx
// src/pages/Admin.tsx
import { useState } from "react";

const ADMIN_USER = "NamasteAdmin";
const ADMIN_PASS = "namaste123";

export default function Admin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      setLoggedIn(true);
      setError("");
      // Optionally store login state in localStorage/Zustand
    } else {
      setError("Invalid credentials");
    }
  };

  if (loggedIn) {
    return (
      <div>
        <h2>Admin Dashboard</h2>
        <p>Welcome, {ADMIN_USER}!</p>
        {/* Future: Add menu item management, image upload, etc. */}
      </div>
    );
  }

  return (
    <div>
      <h2>Admin Login</h2>
      <input
        placeholder="Username"
        value={username}
        onChange={e => setUsername(e.target.value)}
      />
      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>Login</button>
      {error && <p style={{color: "red"}}>{error}</p>}
    </div>
  );
}
```

#### **Routing Example**

```tsx
// src/App.tsx (or your router config)
import Admin from "./pages/Admin";
// ...existing code...
<Route path="/admin" element={<Admin />} />
```

---

### 2. **Food Item Images**

#### **Database Changes**

- Add `imageUrl` column to `MenuItem` table.

**Prisma Schema Example:**

```prisma
model MenuItem {
  id          Int      @id @default(autoincrement())
  name        String
  description String
  price       Float
  dietary     String
  spiceLevel  Int?
  categoryId  Int
  category    MenuCategory @relation(fields: [categoryId], references: [id])
  imageUrl    String?      // New column for image URL
}
```

**Migration SQL Example (PostgreSQL):**

```sql
ALTER TABLE "MenuItem" ADD COLUMN "imageUrl" TEXT;
```

---

#### **Frontend Card Example**

```tsx
// src/pages/Menu.tsx (or MenuSection component)
const placeholderImg = "/images/placeholder-food.png";

<Card>
  <img
    src={item.imageUrl || placeholderImg}
    alt={item.name}
    className="w-full h-48 object-cover"
  />
  {/* ...existing card content... */}
</Card>
```

---

#### **Admin Dashboard Placeholder for Image Upload**

```tsx
// In Admin Dashboard
<button disabled>Upload Image (coming soon)</button>
```

---

### 3. **Next Steps**

1. Update Prisma schema and generate migration for `imageUrl`.
2. Update backend API to handle `imageUrl`.
3. Update frontend to show placeholder images.
4. Implement `/admin` page and login logic.
5. Prepare admin dashboard for future features (image upload, item management).

---

## **Summary**

This blueprint covers:
- Admin login and dashboard setup
- Database changes for food item images
- Frontend updates for image display and future upload
- Code examples for each step

---

Ready to use this plan for implementation!
