# User Data Access Guide

## Where is your user data stored?

Your user data is stored in **MongoDB** database with the following details:

- **Database Host**: `localhost:27017` (your local MongoDB instance)
- **Database Name**: `disaster-preparedness-punjab`
- **Collection Name**: `users`
- **Connection String**: `mongodb://localhost:27017/disaster-preparedness-punjab`

## How to access user data

### Method 1: View All Data (Read-Only)
```bash
node view-users.js
```
This shows you all user information including encrypted passwords (for debugging).

### Method 2: Interactive Admin Panel
```bash
node admin-panel.js
```
This gives you a full management interface to:
- List all users
- Find specific users
- Test passwords
- Update user status
- Reset passwords
- Delete users
- View statistics

### Method 3: MongoDB Compass (GUI Tool)
If you have MongoDB Compass installed:
1. Connect to: `mongodb://localhost:27017`
2. Select database: `disaster-preparedness-punjab`
3. View collection: `users`

### Method 4: MongoDB Command Line
If you have MongoDB shell installed:
```bash
mongosh "mongodb://localhost:27017/disaster-preparedness-punjab"
db.users.find().pretty()
```

### Method 5: Direct Database Queries in Your Code
```javascript
const mongoose = require('mongoose');
const User = require('./models/User'); // Your user model

// Find all users
const users = await User.find({});

// Find with passwords
const usersWithPasswords = await User.find({}).select('+password');

// Find specific user
const user = await User.findOne({ email: 'user@example.com' });
```

## Current Database Statistics

**Total Users**: 10
- **Active Users**: 10
- **Students**: 5
- **Teachers**: 1
- **Parents**: 3
- **Admins**: 1

## Important Security Notes

### Passwords are encrypted using:
- **Algorithm**: bcrypt
- **Salt Rounds**: 12
- **Hash Format**: `$2b$12$...` (60 characters)

### Example encrypted password:
```
Original: "testpass123"
Encrypted: "$2b$12$Ogpv.PEDjHwtqtFddWitA.CCh5WiwNS.e8tNyTvXSTXq4RpPvEbZK"
```

**⚠️ NEVER store or log plain text passwords in production!**

## Sample User Data Structure

```json
{
  "_id": "68c1c3f2bdcb62ac56c2e403",
  "name": "Auth Test User",
  "email": "auth.test@example.com",
  "password": "$2b$12$Ogpv.PEDjHwtqtFddWitA.CCh5WiwNS.e8tNyTvXSTXq4RpPvEbZK",
  "role": "student",
  "phone": "9123456789",
  "school": "Test School",
  "grade": 8,
  "points": 0,
  "badges": [],
  "isActive": true,
  "lastLogin": "2025-09-11T00:01:15.000Z",
  "profile": {
    "district": "Ludhiana",
    "emergencyContact": "9876543210"
  },
  "createdAt": "2025-09-11T00:01:14.000Z",
  "updatedAt": "2025-09-11T00:01:15.000Z"
}
```

## Quick Commands

### View all users quickly:
```bash
node -e "
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/disaster-preparedness-punjab').then(async () => {
  const users = await mongoose.connection.db.collection('users').find({}).toArray();
  console.log('Users:', users.length);
  users.forEach(u => console.log(\`\${u.email} - \${u.name}\`));
  process.exit(0);
});
"
```

### Count users by role:
```bash
node -e "
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/disaster-preparedness-punjab').then(async () => {
  const db = mongoose.connection.db;
  const students = await db.collection('users').countDocuments({role: 'student'});
  const teachers = await db.collection('users').countDocuments({role: 'teacher'});
  const parents = await db.collection('users').countDocuments({role: 'parent'});
  const admins = await db.collection('users').countDocuments({role: 'admin'});
  console.log(\`Students: \${students}, Teachers: \${teachers}, Parents: \${parents}, Admins: \${admins}\`);
  process.exit(0);
});
"
```

## For Production Deployment

When deploying to production, update your `.env` file with:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/disaster-preparedness-punjab
```

Or for services like Heroku, Railway, etc., add the environment variable through their dashboard.
