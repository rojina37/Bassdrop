import { Router } from "express";
import { healthRouter } from "./health.route.js";
import { authRouter } from "./auth.route.js";
import { songsRouter } from "./songs.route.js";
import { artistsRouter } from "./artists.route.js";
import { genresRouter } from "./genres.route.js";
import { playlistsRouter } from "./playlists.route.js";
import { libraryRouter } from "./library.route.js";
import { searchRouter } from "./search.route.js";
import { chatsRouter } from "./chats.route.js";
import { adminRouter } from "./admin.route.js";
import { recommendationsRouter } from "./recommendations.route.js";

export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/songs", songsRouter);
apiRouter.use("/artists", artistsRouter);
apiRouter.use("/genres", genresRouter);
apiRouter.use("/playlists", playlistsRouter);
apiRouter.use("/library", libraryRouter);
apiRouter.use("/search", searchRouter);
apiRouter.use("/chats", chatsRouter);
apiRouter.use("/admin", adminRouter);
apiRouter.use("/recommendations", recommendationsRouter);
