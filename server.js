const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const userRoutes = require("./routes/user.routes.js");
const postRoutes = require("./routes/post.routes.js");
//Qd on va dire process.env.PORT dans le listen, il va nous retranscrire la valeur après le =
require("dotenv").config({ path: "./config/.env" });
require("./config/db");
const { checkUser, requireAuth } = require("./middleware/auth.middleware");
const cors = require("cors");

const app = express();

const corsOptions = {
  origin: process.env.CLIENT_URL,
  credentials: true,
  allowedHeaders: ["sessionId", "Content-Type"],
  exposedHeaders: ["sessionId"],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
};

app.use(cors(corsOptions)); //on autorise tt le monde à nous faire des requêtes en ne mettent rien entre parenthèses

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser()); //Pour que les cookies soient en capacité d'être lu

//jwt
app.get("*", checkUser);
app.get("/jwtid", requireAuth, (req, res) => {
  res.status(200).send(res.locals.user._id);
}); //permet de connecter l'user automatiquement (comme ça il a pas besoin de quitter le site, et de devoir se reconnecter constamment, grâce aux cookies)

//routes (middlewares)
app.use("/api/user", userRoutes);
app.use("/api/post", postRoutes);
//tjr à la fin
app.listen(process.env.PORT, () => {
  console.log(`listening on port ${process.env.PORT}`);
});
