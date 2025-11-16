# Guided Questions Templates

This directory contains the guided questions system for Project Echo's spot creation feature. When users create a "Spot" (a review of a place they've visited), they're prompted with category-specific questions to structure their reviews.

## Files

- **`guided-questions-templates.json`** - The main template file containing all questions organized by category
- **`seed-guided-questions.ts`** - TypeScript seed script to load templates into the database
- **`guided-questions-schema.prisma`** - Prisma schema for the `guided_question_templates` table

## Categories

The system includes questions for 6 main place categories:

1. **Restaurants** - Questions about food, price, dietary options, service
2. **Fitness** - Questions about workout types, equipment, amenities
3. **Beauty** - Questions about services, price, ambiance, staff
4. **Bars & Clubs** - Questions about drinks, music, crowd, vibe
5. **Culture Attractions** - Questions about must-see items, duration, tickets
6. **Nature** - Questions about difficulty, duration, amenities, best time

## Question Types

Each question can be one of three types:

- **`text`** - Free-form text input
- **`select`** - Single choice from a list of options
- **`multiselect`** - Multiple choices from a list of options

## Default Questions

All categories include these default questions:
- "What's the vibe?" (text)
- "Best time to visit?" (text)
- "How crowded does it get?" (select)

## Category-Specific Questions

Each category has 5-9 additional questions tailored to that type of place. For example:

- **Restaurants**: "What's the one dish you must order?", "Price range?", "Dietary options?"
- **Fitness**: "What type of workout is this best for?", "Equipment quality?", "Membership required?"
- **Bars & Clubs**: "What's the one drink you must order?", "What type of music?", "Best night to go?"

## Database Schema

The `guided_question_templates` table stores:
- Category mapping (which Foursquare categories map to which question set)
- Question text and type
- Display order
- Options for select/multiselect questions
- Required vs optional flag

## Usage

### 1. Add to Prisma Schema

Copy the schema from `guided-questions-schema.prisma` into your main `schema.prisma` file.

### 2. Create Migration

```bash
npx prisma migrate dev --name add_guided_question_templates
```

### 3. Seed the Database

Update the seed script to include guided questions:

```typescript
// In your main seed file or run separately
import { seedGuidedQuestions } from './seed-guided-questions';

await seedGuidedQuestions();
```

Or run directly:
```bash
npx ts-node documents/seed-guided-questions.ts
```

### 4. Use in Application

When a user creates a spot:

1. Determine the place's category from Foursquare data
2. Query `guided_question_templates` for that category
3. Also include default questions
4. Display questions in the spot creation UI
5. Store user's answers in the `spots.guided_questions` JSONB field

Example query:
```typescript
// Get questions for a restaurant
const questions = await prisma.guidedQuestionTemplate.findMany({
  where: {
    OR: [
      { category: 'restaurant' },
      { category: 'default' }
    ],
    foursquareCategories: {
      has: placeCategory // e.g., "Restaurant", "Pizza Place"
    }
  },
  orderBy: {
    displayOrder: 'asc'
  }
});
```

## Adding New Categories

To add a new category:

1. Add a new category object to `guided-questions-templates.json`
2. Include:
   - `category`: unique identifier (lowercase, underscores)
   - `displayName`: human-readable name
   - `foursquareCategories`: array of Foursquare category names
   - `questions`: array of question objects
3. Re-run the seed script

## Adding New Questions

To add a question to an existing category:

1. Edit the category's `questions` array in `guided-questions-templates.json`
2. Add a question object with:
   - `id`: unique identifier
   - `question`: the question text
   - `type`: "text", "select", or "multiselect"
   - `required`: boolean
   - `placeholder`: optional placeholder text
   - `options`: array of options (for select/multiselect)
   - `order`: display order
3. Re-run the seed script

## Question Structure

```json
{
  "id": "must_order",
  "question": "What's the one dish you must order?",
  "type": "text",
  "required": false,
  "placeholder": "e.g., The truffle pasta, Wagyu burger",
  "order": 1
}
```

## Foursquare Category Mapping

The system maps Foursquare place categories to our question templates. For example:
- "Restaurant", "Pizza Place", "Café" → `restaurant` questions
- "Gym / Fitness Center", "Yoga Studio" → `fitness` questions
- "Bar", "Nightclub", "Cocktail Bar" → `bars_and_clubs` questions

If a place category doesn't match any template, only default questions are shown.

## Future Enhancements

Potential improvements:
- User-customizable questions
- Question analytics (which questions get answered most)
- A/B testing different question sets
- Localization for different languages
- Question recommendations based on place type

## Notes

- Questions are stored as JSONB in the `spots` table for flexibility
- The template system allows easy updates without code changes
- Questions can be made required or optional per category
- Display order ensures consistent UX across categories

