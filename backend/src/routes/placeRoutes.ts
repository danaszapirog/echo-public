import { Router } from 'express';
import { searchPlaces, getPlaceDetails, getPlaceQuestions, getPlaceSummaryHandler } from '../controllers/placeController';

const router = Router();

router.get('/search', searchPlaces);
router.get('/:placeId/summary', getPlaceSummaryHandler);
router.get('/:placeId/questions', getPlaceQuestions);
router.get('/:placeId', getPlaceDetails);

export default router;

