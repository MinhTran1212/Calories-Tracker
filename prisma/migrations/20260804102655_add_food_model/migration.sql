-- CreateTable
CREATE TABLE "Food" (
    "Id" SERIAL NOT NULL,
    "name" TEXT,
    "protein" INTEGER NOT NULL,
    "carb" INTEGER NOT NULL,
    "fat" INTEGER NOT NULL,
    "calories" INTEGER NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Food_pkey" PRIMARY KEY ("Id")
);
