/**
 * Seed script for guided question templates
 * 
 * This script loads the guided-questions-templates.json file and inserts
 * the data into the guided_question_templates table.
 * 
 * Usage:
 *   - With Prisma: npx ts-node prisma/seed-guided-questions.ts
 *   - Or integrate into your main seed file
 */

import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface Question {
  id: string;
  question: string;
  type: 'text' | 'select' | 'multiselect';
  required: boolean;
  placeholder?: string;
  options?: string[];
  order: number;
}

interface CategoryTemplate {
  category: string;
  displayName: string;
  foursquareCategories: string[];
  questions: Question[];
}

interface TemplatesData {
  version: string;
  defaultQuestions: Question[];
  categories: CategoryTemplate[];
}

async function seedGuidedQuestions() {
  try {
    console.log('🌱 Starting guided questions seed...');

    // Read the JSON file
    const filePath = path.join(__dirname, 'guided-questions-templates.json');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const data: TemplatesData = JSON.parse(fileContent);

    // Clear existing templates (optional - comment out if you want to keep existing)
    console.log('🗑️  Clearing existing templates...');
    await prisma.guidedQuestionTemplate.deleteMany({});

    // Insert default questions (these apply to all categories)
    console.log('📝 Inserting default questions...');
    for (const question of data.defaultQuestions) {
      await prisma.guidedQuestionTemplate.create({
        data: {
          category: 'default',
          displayName: 'Default',
          questionId: question.id,
          questionText: question.question,
          questionType: question.type,
          isRequired: question.required,
          placeholder: question.placeholder || null,
          options: question.options ? JSON.stringify(question.options) : null,
          displayOrder: question.order,
          foursquareCategories: [],
        },
      });
    }

    // Insert category-specific questions
    console.log('📚 Inserting category-specific questions...');
    for (const category of data.categories) {
      console.log(`  → Processing ${category.displayName}...`);
      
      for (const question of category.questions) {
        await prisma.guidedQuestionTemplate.create({
          data: {
            category: category.category,
            displayName: category.displayName,
            questionId: question.id,
            questionText: question.question,
            questionType: question.type,
            isRequired: question.required,
            placeholder: question.placeholder || null,
            options: question.options ? JSON.stringify(question.options) : null,
            displayOrder: question.order,
            foursquareCategories: category.foursquareCategories,
          },
        });
      }
    }

    console.log('✅ Guided questions seed completed successfully!');
    console.log(`   - Default questions: ${data.defaultQuestions.length}`);
    console.log(`   - Categories: ${data.categories.length}`);
    console.log(`   - Total questions: ${data.defaultQuestions.length + data.categories.reduce((sum, cat) => sum + cat.questions.length, 0)}`);

  } catch (error) {
    console.error('❌ Error seeding guided questions:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed
seedGuidedQuestions()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

