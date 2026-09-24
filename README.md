# Food Ordering Management System using Redis

A full-stack food menu manager built with Express, Redis, and vanilla HTML/CSS/JavaScript.

## Run locally

1. Copy `.env.example` to `.env` and add your Redis Cloud `REDIS_URL`.
2. Install packages with `npm install`.
3. Start the app with `npm start`.
4. Open `http://localhost:3000`.

## REST API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/api/food` | Store one food item |
| GET | `/api/food/:name` | Retrieve a food item |
| POST | `/api/foods` | Insert the three lab sample foods using `MSET` |
| GET | `/api/foods` | List all food items for the dashboard |
| POST | `/api/append` | Append an attribute to an existing food |
| GET | `/api/length/:name` | Get the Redis string length |
| DELETE | `/api/food/:name` | Delete a food item |

Food names are Redis keys. Values use the lab format: `FoodID:F101,Category:Italian,Price:12.99`.

## Deploy to Render

Push the entire project to GitHub, create a Render Web Service, and set `REDIS_URL` in the service environment variables. The included `render.yaml` supplies the build and start commands.

Before deploying, ensure these exact paths exist in the GitHub repository. Render runs Linux, so their capitalization matters:

```text
server.js
routes/foodRoutes.js
controllers/foodController.js
config/redis.js
```

Set Render's **Root Directory** to the folder containing `package.json` and `server.js` (leave it blank when they are at the repository root). Then deploy the latest GitHub commit.
