# CSC430Midterm

# 📄 API Routes and Middleware Explained

## 1. General Setup

**Importing Modules**: We use common Node.js modules like `express` for routing, `pg` for PostgreSQL, `bcrypt` for password hashing, `jsonwebtoken` for authentication, and more.

**Middleware**:
- **morgan**: Logs requests to the server for easier debugging.
- **cors**: Enables cross-origin requests, which allows your API to be called from different domains.
- **Custom Middleware** (`authenticateToken`): Ensures certain routes are accessed only by authenticated users via JWT.

## Routes Breakdown 🚀

### 🗂 User Management

1. **`/getUsers` [GET]**
   - Retrieves all users in the database. **(Testing purposes)**

2. **`/createUser` [POST]**
   - Creates a user by directly adding a `username`, `password`, and `email`. **(Testing purposes)**

3. **`/register` [POST]**
   - **Production Route**: Adds a new user to the database.
   - **Password Hashing**: Uses `bcrypt` to hash the password.
   - **Validation**: Checks for duplicate emails or usernames before creation.

4. **`/login` [POST]**
   - Authenticates a user.
   - Checks the provided `email` and `password` against the database.
   - If authenticated, generates a JWT token which can be used for accessing protected routes.

### 🛒 Category and Item Management

1. **`/makeCategory` [POST]**
   - Creates a new category (e.g., Electronics, Clothing).

2. **`/getCategories` [GET]**
   - Retrieves all available categories from the database.

3. **`/deleteCategory/:categoryID` [DELETE]**
   - Deletes a specific category based on `categoryID`.

4. **`/postItem` [POST]**
   - Adds an item to the inventory.
   - If an item with the same name, category, and price already exists, it increases the stock count.
   - **Example**: Add an item called "Laptop" to the Electronics category.

5. **`/getItems` [GET]**
   - Retrieves all items currently available in the inventory.

6. **`/getItemsByCategory/:categoryID` [GET]**
   - Gets all items in a specified category by providing the `categoryID`.

7. **`/deleteItem/:itemID` [DELETE]**
   - Deletes an item from the inventory based on `itemID`.

### 🛒 Cart Management

1. **`/addToCart` [POST]**
   - **Middleware**: Uses `authenticateToken` to ensure the user is logged in.
   - Adds an item to the user's cart. If the item already exists, it increases the quantity.

2. **`/deleteCartItem/:cartItemID` [DELETE]**
   - Deletes one instance of an item from the user's cart by `cartItemID`.
   - If the quantity is greater than 1, it decreases the quantity by 1.

3. **`/getCartItems` [GET]**
   - **Middleware**: Uses `authenticateToken`.
   - Retrieves all items currently in the user's cart, along with item details.

### 🛒 Checkout & Purchase Management

1. **`/checkout` [POST]**
   - **Middleware**: Uses `authenticateToken`.
   - **Process**:
     - Retrieves all items in the user's cart.
     - **Stock Check**: Ensures that requested quantities are available.
     - Deducts the quantity from the inventory.
     - Adds purchase information to the `Purchase` table.
     - Clears the user's cart upon successful purchase.
     - **Rollback**: If any step fails (e.g., out of stock), the entire transaction is rolled back to ensure data integrity.

2. **`/getPurchases` [GET]**
   - **Middleware**: Uses `authenticateToken`.
   - Gets all the user's purchases, including the items purchased.

3. **`/getAllPurchases` [GET]**
   - Retrieves **all** purchases made by all users.
   - Useful for admins to track overall purchases.

---

## Middleware Breakdown 🛡️

### **`authenticateToken`**
This custom middleware checks for a JWT token in the `access-token` header to ensure the user is authenticated.

- **Process**:
  - Retrieves the token from the request headers.
  - Uses `jsonwebtoken` to verify if the token is valid using a secret key (`process.env.SECRET_KEY`).
  - If the token is valid, attaches the decoded user information (e.g., `userId`) to the request object so it can be used in subsequent route handlers.
  - **Example Usage**: Protecting routes like `/addToCart`, `/checkout`, etc.

---

## Usage Scenario Example 📋

### **User Registration and Authentication**:
- A new user registers using `/register`.
- The user then logs in via `/login`, which returns a JWT token.

### **Category and Item Management**:
- Admin creates a category using `/makeCategory`.
- Adds items using `/postItem`.

### **Cart Management**:
- The logged-in user adds items to their cart via `/addToCart` (requires a valid JWT token).
- They can check their cart contents with `/getCartItems`.

### **Checkout**:
- Once the user is ready to buy, they call `/checkout` to complete the purchase.
- The system deducts the items from inventory and records the transaction.
- Users can view their past purchases using `/getPurchases`.

---

## Tools and Concepts Utilized ⚙️
- **Express.js**: Manages API routes and middleware.
- **PostgreSQL** (`pg`): The database for storing users, items, categories, cart items, and purchases.
- **JWT** (`jsonwebtoken`): Used for authenticating users and protecting routes.
- **bcrypt**: Hashes passwords before saving them to ensure user data security.
- **Transactions**: Used in the `/checkout` route to ensure that multiple database operations succeed or fail as a group.

## Security Measures 🔒
- **Password Hashing**: Passwords are securely hashed using `bcrypt` before being saved.
- **JWT Authentication**: Tokens are generated during login to ensure secure access to certain routes.
- **Input Validation**: Various checks are made to ensure emails, usernames, and other input data are unique or properly formatted.


