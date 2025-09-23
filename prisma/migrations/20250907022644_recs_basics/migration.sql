-- CreateTable
CREATE TABLE "public"."View" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "submissionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "View_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TagPref" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "weight" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TagPref_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "View_userId_createdAt_idx" ON "public"."View"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "View_submissionId_createdAt_idx" ON "public"."View"("submissionId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "TagPref_userId_tag_key" ON "public"."TagPref"("userId", "tag");
