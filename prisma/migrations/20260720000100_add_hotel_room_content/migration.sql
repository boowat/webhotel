-- CreateTable
CREATE TABLE "hotels" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tagline" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "rating" DECIMAL(3,1) NOT NULL,
    "review_count" INTEGER NOT NULL,
    "price_per_night" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'IDR',
    "hero_image" TEXT NOT NULL,
    "hero_seed" TEXT NOT NULL,
    "gallery" JSONB NOT NULL,
    "description" TEXT NOT NULL,
    "highlights" TEXT[] NOT NULL,
    "amenities" TEXT[] NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hotels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rooms" (
    "id" TEXT NOT NULL,
    "hotel_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price_per_night" DECIMAL(12,2) NOT NULL,
    "max_guests" INTEGER NOT NULL,
    "beds" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "size_area" TEXT,
    "image" TEXT NOT NULL,
    "image_seed" TEXT NOT NULL,
    "total_units" INTEGER NOT NULL DEFAULT 10,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "hotel_id" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "date" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "hotels_sort_order_idx" ON "hotels"("sort_order");

-- CreateIndex
CREATE INDEX "rooms_hotel_id_idx" ON "rooms"("hotel_id");

-- CreateIndex
CREATE INDEX "rooms_sort_order_idx" ON "rooms"("sort_order");

-- CreateIndex
CREATE INDEX "reviews_hotel_id_idx" ON "reviews"("hotel_id");

-- CreateIndex
CREATE INDEX "reviews_sort_order_idx" ON "reviews"("sort_order");

-- AddForeignKey
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_hotel_id_fkey" FOREIGN KEY ("hotel_id") REFERENCES "hotels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_hotel_id_fkey" FOREIGN KEY ("hotel_id") REFERENCES "hotels"("id") ON DELETE CASCADE ON UPDATE CASCADE;
