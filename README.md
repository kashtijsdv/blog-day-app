# blog-day-app
# BLOGDAY — Where Stories Live

A lightweight, client-side blogging platform built with vanilla HTML, CSS, and jQuery. No backend or database required — all data is stored in the browser.

---

## Features

- **User Authentication** — Register, sign in, and sign out with session-based login
- **Password Management** — Change your password or reset it via username lookup
- **Write & Publish** — Create blog posts with title, author, and content
- **Read & Browse** — View all published stories in a responsive card grid
- **Live Search** — Filter posts by keyword in real time
- **Blog Detail Panel** — Open any post in a slide-over panel with read-time estimate
- **Delete Posts** — Authors can delete their own posts from the detail panel
- **Responsive Design** — Mobile-friendly layout with a hamburger navigation menu
- **Persistent Storage** — Posts and account data survive page refreshes via `localStorage`

---

## Project Structure

```
blog-day-app/
├── index.html           # Landing page with hero section and feature cards
├── login.html           # Sign in form
├── register.html        # Create account form
├── forgot.html          # Reset password by username
├── change-password.html # Change password (requires current password)
├── write.html           # Compose and publish a new blog post
├── read.html            # Browse all posts; live search; detail panel
├── style.css            # All styles (dark theme, gold accents, responsive)
└── script.js            # All logic: auth, blog CRUD, UI interactions (jQuery)
```

---

## Getting Started

No build tools or server needed.

1. Clone or download the repository.
2. Open `index.html` in any modern browser.
3. Create an account, write a post, and start reading.

```bash
git clone https://github.com/your-username/blog-day-app.git
cd blog-day-app
open index.html   # macOS
# or just double-click index.html on Windows/Linux
```

---

## How It Works

### Storage

All data is saved to the browser's `localStorage` under three keys:

| Key        | Value                              |
|------------|------------------------------------|
| `bd_user`  | Registered username                |
| `bd_pass`  | Password (base64-obfuscated)       |
| `bd_email` | Registered email address           |
| `bd_blogs` | JSON array of all blog post objects |

Session state (who is currently logged in) is tracked via `sessionStorage` under `bd_session`. Closing the browser tab signs the user out.

> **Note:** This is a client-side demo. Data is stored per browser and is not shared between devices. Passwords are base64-encoded for obfuscation — this is not a substitute for real encryption in a production app.

### Authentication Flow

1. **Register** — saves username, email, and obfuscated password to `localStorage`
2. **Sign In** — verifies credentials against stored values; writes username to `sessionStorage`
3. **Sign Out** — clears `sessionStorage` and redirects to home
4. **Forgot Password** — finds account by username and sets a new password
5. **Change Password** — verifies the current password before updating

### Password Rules

- Minimum 6 characters
- At least one uppercase letter
- At least one number

### Blog Posts

Each post is stored as an object with the following shape:

```json
{
  "id": 1713890000000,
  "title": "My First Story",
  "author": "username",
  "content": "Full post content...",
  "date": 1713890000000
}
```

Posts are prepended to the array so the newest appear first. Read time is estimated at 200 words per minute.

---

## Pages Overview

| Page                  | Description                                      |
|-----------------------|--------------------------------------------------|
| `index.html`          | Hero landing page with links to all features     |
| `login.html`          | Sign in; links to forgot/change password         |
| `register.html`       | Create a new account                             |
| `forgot.html`         | Reset password using your username               |
| `change-password.html`| Update password using your current one           |
| `write.html`          | Write and publish a blog post (10,000 char limit)|
| `read.html`           | Browse all posts; click a card to read in full   |

---

## Dependencies

- [jQuery 3.7.1](https://jquery.com/) — loaded via CDN

No other frameworks or libraries are required.

---

## Browser Support

Works in all modern browsers (Chrome, Firefox, Safari, Edge). Requires JavaScript enabled and `localStorage` available.

---

## Limitations

Since this is a fully client-side app:

- Only one user account can be registered per browser
- Data is not shared between browsers or devices
- Clearing browser storage will erase all posts and account data
- Passwords are obfuscated but not cryptographically hashed — not suitable for production use as-is

---

## License

MIT — free to use and modify.
