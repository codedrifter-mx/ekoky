-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_impact_metrics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "address" TEXT NOT NULL,
    "offersCreated" INTEGER NOT NULL DEFAULT 0,
    "offersFulfilled" INTEGER NOT NULL DEFAULT 0,
    "interestsAccepted" INTEGER NOT NULL DEFAULT 0,
    "foodDivertedKg" REAL NOT NULL DEFAULT 0,
    "co2SavedKg" REAL NOT NULL DEFAULT 0,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "impact_metrics_address_fkey" FOREIGN KEY ("address") REFERENCES "users" ("address") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_impact_metrics" ("address", "co2SavedKg", "foodDivertedKg", "id", "interestsAccepted", "offersCreated", "offersFulfilled", "updatedAt") SELECT "address", "co2SavedKg", "foodDivertedKg", "id", "interestsAccepted", "offersCreated", "offersFulfilled", "updatedAt" FROM "impact_metrics";
DROP TABLE "impact_metrics";
ALTER TABLE "new_impact_metrics" RENAME TO "impact_metrics";
CREATE UNIQUE INDEX "impact_metrics_address_key" ON "impact_metrics"("address");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "offers_onChainId_idx" ON "offers"("onChainId");
