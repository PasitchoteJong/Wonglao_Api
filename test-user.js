import { prisma } from "./lib/prisma.js";

const user = await prisma.user.findUnique({
    where: {
        Id: "e3739d4b-762f-4485-a457-6aba9c19632f",
    },
});

console.log("USER =", user);

await prisma.$disconnect();