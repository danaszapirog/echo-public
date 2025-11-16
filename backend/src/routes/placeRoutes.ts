import { Router } from 'express';
import { searchPlaces, getPlaceDetails } from '../controllers/placeController';

const router = Router();

router.get('/search', searchPlaces);
router.get('/:placeId', getPlaceDetails);

export default router;

