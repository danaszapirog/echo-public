import { prisma } from '../config/prisma';

export interface QuestionTemplate {
  id: string;
  questionId: string;
  question: string;
  type: 'text' | 'select' | 'multiselect';
  required: boolean;
  placeholder?: string;
  options?: string[];
  order: number;
}

/**
 * Map Foursquare category to our template category
 */
export function mapFoursquareCategoryToTemplate(foursquareCategory: string): string | null {
  // Normalize the category name (lowercase, trim)
  const normalized = foursquareCategory.toLowerCase().trim();

  // Map Foursquare categories to our template categories
  const categoryMappings: Record<string, string> = {
    // Restaurant categories
    'restaurant': 'restaurant',
    'food & drink': 'restaurant',
    'café': 'restaurant',
    'cafe': 'restaurant',
    'fast food restaurant': 'restaurant',
    'pizza place': 'restaurant',
    'asian restaurant': 'restaurant',
    'italian restaurant': 'restaurant',
    'mexican restaurant': 'restaurant',
    'american restaurant': 'restaurant',
    'french restaurant': 'restaurant',
    'japanese restaurant': 'restaurant',
    'chinese restaurant': 'restaurant',
    'thai restaurant': 'restaurant',
    'indian restaurant': 'restaurant',
    'mediterranean restaurant': 'restaurant',
    'seafood restaurant': 'restaurant',
    'steakhouse': 'restaurant',
    'bbq joint': 'restaurant',
    'diner': 'restaurant',
    'brunch spot': 'restaurant',

    // Fitness categories
    'gym / fitness center': 'fitness',
    'gym': 'fitness',
    'fitness center': 'fitness',
    'yoga studio': 'fitness',
    'pilates studio': 'fitness',
    'crossfit gym': 'fitness',
    'boxing gym': 'fitness',
    'martial arts dojo': 'fitness',
    'dance studio': 'fitness',
    'rock climbing gym': 'fitness',
    'swimming pool': 'fitness',
    'tennis court': 'fitness',
    'basketball court': 'fitness',
    'running track': 'fitness',
    'outdoor gym': 'fitness',
    'personal trainer': 'fitness',
    'fitness class': 'fitness',

    // Beauty categories
    'hair salon': 'beauty',
    'nail salon': 'beauty',
    'spa': 'beauty',
    'massage': 'beauty',
    'beauty salon': 'beauty',
    'barbershop': 'beauty',
    'waxing salon': 'beauty',
    'eyelash studio': 'beauty',
    'brow studio': 'beauty',
    'makeup artist': 'beauty',
    'facial spa': 'beauty',
    'med spa': 'beauty',
    'tattoo parlor': 'beauty',
    'piercing studio': 'beauty',

    // Bars & Clubs
    'bar': 'bars_and_clubs',
    'nightclub': 'bars_and_clubs',
    'cocktail bar': 'bars_and_clubs',
    'wine bar': 'bars_and_clubs',
    'beer bar': 'bars_and_clubs',
    'sports bar': 'bars_and_clubs',
    'dive bar': 'bars_and_clubs',
    'rooftop bar': 'bars_and_clubs',
    'speakeasy': 'bars_and_clubs',
    'brewery': 'bars_and_clubs',
    'pub': 'bars_and_clubs',
    'karaoke bar': 'bars_and_clubs',
    'jazz club': 'bars_and_clubs',
    'dance club': 'bars_and_clubs',
    'lounge': 'bars_and_clubs',

    // Culture Attractions
    'museum': 'culture_attractions',
    'art gallery': 'culture_attractions',
    'theater': 'culture_attractions',
    'concert hall': 'culture_attractions',
    'opera house': 'culture_attractions',
    'cinema': 'culture_attractions',
    'historic site': 'culture_attractions',
    'monument': 'culture_attractions',
    'library': 'culture_attractions',
    'cultural center': 'culture_attractions',
    'performing arts venue': 'culture_attractions',
    'comedy club': 'culture_attractions',
    'convention center': 'culture_attractions',
    'exhibition center': 'culture_attractions',
    'planetarium': 'culture_attractions',

    // Nature
    'park': 'nature',
    'beach': 'nature',
    'hiking trail': 'nature',
    'mountain': 'nature',
    'viewpoint': 'nature',
    'scenic lookout': 'nature',
    'waterfall': 'nature',
    'lake': 'nature',
    'forest': 'nature',
    'garden': 'nature',
    'botanical garden': 'nature',
    'national park': 'nature',
    'state park': 'nature',
    'nature reserve': 'nature',
    'wildlife area': 'nature',
    'campground': 'nature',
    'picnic area': 'nature',
  };

  return categoryMappings[normalized] || null;
}

/**
 * Get default questions that apply to all categories
 */
export async function getDefaultQuestions(): Promise<QuestionTemplate[]> {
  const templates = await prisma.guidedQuestionTemplate.findMany({
    where: {
      category: 'default',
    },
    orderBy: {
      displayOrder: 'asc',
    },
  });

  return templates.map((t) => ({
    id: t.id,
    questionId: t.questionId,
    question: t.questionText,
    type: t.questionType as 'text' | 'select' | 'multiselect',
    required: t.isRequired,
    placeholder: t.placeholder || undefined,
    options: t.options ? (t.options as string[]) : undefined,
    order: t.displayOrder,
  }));
}

/**
 * Get questions for a specific category
 * Includes both default questions and category-specific questions
 */
export async function getQuestionsForCategory(
  category: string,
  foursquareCategory?: string
): Promise<QuestionTemplate[]> {
  // First, try to map Foursquare category to our template category
  let templateCategory: string | null = null;
  if (foursquareCategory) {
    templateCategory = mapFoursquareCategoryToTemplate(foursquareCategory);
  }

  // If no mapping found, use the provided category
  if (!templateCategory) {
    templateCategory = category;
  }

  // Get default questions
  const defaultQuestions = await getDefaultQuestions();

  // Get category-specific questions
  const categoryQuestions = await prisma.guidedQuestionTemplate.findMany({
    where: {
      category: templateCategory,
    },
    orderBy: {
      displayOrder: 'asc',
    },
  });

  const categoryTemplates: QuestionTemplate[] = categoryQuestions.map((t) => ({
    id: t.id,
    questionId: t.questionId,
    question: t.questionText,
    type: t.questionType as 'text' | 'select' | 'multiselect',
    required: t.isRequired,
    placeholder: t.placeholder || undefined,
    options: t.options ? (t.options as string[]) : undefined,
    order: t.displayOrder,
  }));

  // Combine default and category-specific questions, sorted by order
  const allQuestions = [...defaultQuestions, ...categoryTemplates];
  return allQuestions.sort((a, b) => a.order - b.order);
}

/**
 * Validate that question IDs exist in templates
 */
export async function validateQuestionIds(questionIds: string[]): Promise<boolean> {
  const templates = await prisma.guidedQuestionTemplate.findMany({
    where: {
      questionId: {
        in: questionIds,
      },
    },
    select: {
      questionId: true,
    },
  });

  const validIds = new Set(templates.map((t) => t.questionId));
  return questionIds.every((id) => validIds.has(id));
}

