import express from 'express';
import cors from 'cors';
import passport from "passport";
import router from '../routes/route.js';

const init = () => {
    const app = express();
    app.use(cors());
    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ extended: false }));
    app.use(passport.initialize())
    app.use(passport.session())
    app.use('/api/v1', router);
    return app;
}
export default init;
