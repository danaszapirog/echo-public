-- CreateTable
CREATE TABLE "guided_question_templates" (
    "id" UUID NOT NULL,
    "category" VARCHAR(50) NOT NULL,
    "display_name" VARCHAR(100) NOT NULL,
    "question_id" VARCHAR(100) NOT NULL,
    "question_text" TEXT NOT NULL,
    "question_type" VARCHAR(20) NOT NULL,
    "is_required" BOOLEAN NOT NULL DEFAULT false,
    "placeholder" TEXT,
    "options" JSONB,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "foursquare_categories" TEXT[],
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "guided_question_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "guided_question_templates_category_idx" ON "guided_question_templates"("category");

-- CreateIndex
CREATE INDEX "guided_question_templates_question_id_idx" ON "guided_question_templates"("question_id");
