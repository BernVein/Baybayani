-- CreateTable
CREATE TABLE "StoreConfig" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "openingHour" INTEGER NOT NULL DEFAULT 6,
    "openingMinute" INTEGER NOT NULL DEFAULT 0,
    "closingHour" INTEGER NOT NULL DEFAULT 22,
    "closingMinute" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "StoreConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StoreConfig_key_key" ON "StoreConfig"("key");
