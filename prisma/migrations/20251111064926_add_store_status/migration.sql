-- CreateTable
CREATE TABLE "store_status" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "isOpen" BOOLEAN NOT NULL DEFAULT true,
    "closedMessage" TEXT,
    "reopenTime" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "store_status_pkey" PRIMARY KEY ("id")
);
