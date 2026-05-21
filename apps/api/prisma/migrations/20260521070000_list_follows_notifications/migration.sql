-- Add list following and notification lookup indexes.

CREATE TABLE "CustomListFollow" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "listId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomListFollow_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CustomListFollow_userId_listId_key" ON "CustomListFollow"("userId", "listId");
CREATE INDEX "CustomListFollow_userId_createdAt_idx" ON "CustomListFollow"("userId", "createdAt");
CREATE INDEX "CustomListFollow_listId_createdAt_idx" ON "CustomListFollow"("listId", "createdAt");

CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");
CREATE INDEX "Notification_userId_readAt_idx" ON "Notification"("userId", "readAt");

ALTER TABLE "CustomListFollow" ADD CONSTRAINT "CustomListFollow_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CustomListFollow" ADD CONSTRAINT "CustomListFollow_listId_fkey" FOREIGN KEY ("listId") REFERENCES "CustomList"("id") ON DELETE CASCADE ON UPDATE CASCADE;
