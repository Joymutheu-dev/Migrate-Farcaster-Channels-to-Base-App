import { Router } from 'express';
import subscribeRoutes from './routes/subscribe';
import migrateRoutes from './routes/migrate';
import postRoutes from './routes/posts';

const router = Router();

// Mount routes
router.use(subscribeRoutes);
router.use(migrateRoutes);
router.use(postRoutes);

export default router;