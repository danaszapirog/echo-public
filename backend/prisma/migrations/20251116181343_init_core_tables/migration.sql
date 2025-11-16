-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "bio" TEXT,
    "profile_picture_url" TEXT,
    "role" VARCHAR(20) NOT NULL DEFAULT 'consumer',
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_private" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "last_login_at" TIMESTAMPTZ(6),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "places" (
    "id" UUID NOT NULL,
    "external_place_id" VARCHAR(255) NOT NULL,
    "external_provider" VARCHAR(50) NOT NULL DEFAULT 'foursquare',
    "name" VARCHAR(255) NOT NULL,
    "latitude" DECIMAL(10,8) NOT NULL,
    "longitude" DECIMAL(11,8) NOT NULL,
    "categories" JSONB,
    "cached_data" JSONB,
    "cached_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "places_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spots" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "place_id" UUID NOT NULL,
    "rating" INTEGER NOT NULL,
    "notes" TEXT,
    "tags" TEXT[],
    "photos" JSONB,
    "guided_questions" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "spots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "want_to_go" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "place_id" UUID NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "want_to_go_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "playlists" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "cover_image_url" TEXT,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "published_at" TIMESTAMPTZ(6),

    CONSTRAINT "playlists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "playlist_spots" (
    "playlist_id" UUID NOT NULL,
    "spot_id" UUID NOT NULL,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "added_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "playlist_spots_pkey" PRIMARY KEY ("playlist_id","spot_id")
);

-- CreateTable
CREATE TABLE "follows" (
    "id" UUID NOT NULL,
    "follower_id" UUID NOT NULL,
    "followee_id" UUID NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "follows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feed_items" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "content_type" VARCHAR(20) NOT NULL,
    "content_id" UUID NOT NULL,
    "author_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feed_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_username_idx" ON "users"("username");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE UNIQUE INDEX "places_external_place_id_key" ON "places"("external_place_id");

-- CreateIndex
CREATE INDEX "places_external_place_id_idx" ON "places"("external_place_id");

-- CreateIndex
CREATE INDEX "places_categories_idx" ON "places" USING GIN ("categories");

-- CreateIndex
CREATE INDEX "spots_user_id_idx" ON "spots"("user_id");

-- CreateIndex
CREATE INDEX "spots_place_id_idx" ON "spots"("place_id");

-- CreateIndex
CREATE INDEX "spots_created_at_idx" ON "spots"("created_at" DESC);

-- CreateIndex
CREATE INDEX "spots_tags_idx" ON "spots" USING GIN ("tags");

-- CreateIndex
CREATE UNIQUE INDEX "spots_user_id_place_id_key" ON "spots"("user_id", "place_id");

-- CreateIndex
CREATE INDEX "want_to_go_user_id_idx" ON "want_to_go"("user_id");

-- CreateIndex
CREATE INDEX "want_to_go_place_id_idx" ON "want_to_go"("place_id");

-- CreateIndex
CREATE UNIQUE INDEX "want_to_go_user_id_place_id_key" ON "want_to_go"("user_id", "place_id");

-- CreateIndex
CREATE INDEX "playlists_user_id_idx" ON "playlists"("user_id");

-- CreateIndex
CREATE INDEX "playlists_is_published_published_at_idx" ON "playlists"("is_published", "published_at" DESC);

-- CreateIndex
CREATE INDEX "playlist_spots_playlist_id_display_order_idx" ON "playlist_spots"("playlist_id", "display_order");

-- CreateIndex
CREATE INDEX "playlist_spots_spot_id_idx" ON "playlist_spots"("spot_id");

-- CreateIndex
CREATE INDEX "follows_follower_id_status_idx" ON "follows"("follower_id", "status");

-- CreateIndex
CREATE INDEX "follows_followee_id_status_idx" ON "follows"("followee_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "follows_follower_id_followee_id_key" ON "follows"("follower_id", "followee_id");

-- CreateIndex
CREATE INDEX "feed_items_user_id_created_at_idx" ON "feed_items"("user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "feed_items_author_id_idx" ON "feed_items"("author_id");

-- AddForeignKey
ALTER TABLE "spots" ADD CONSTRAINT "spots_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spots" ADD CONSTRAINT "spots_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "places"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "want_to_go" ADD CONSTRAINT "want_to_go_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "want_to_go" ADD CONSTRAINT "want_to_go_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "places"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "playlists" ADD CONSTRAINT "playlists_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "playlist_spots" ADD CONSTRAINT "playlist_spots_playlist_id_fkey" FOREIGN KEY ("playlist_id") REFERENCES "playlists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "playlist_spots" ADD CONSTRAINT "playlist_spots_spot_id_fkey" FOREIGN KEY ("spot_id") REFERENCES "spots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follows" ADD CONSTRAINT "follows_follower_id_fkey" FOREIGN KEY ("follower_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follows" ADD CONSTRAINT "follows_followee_id_fkey" FOREIGN KEY ("followee_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feed_items" ADD CONSTRAINT "feed_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feed_items" ADD CONSTRAINT "feed_items_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
