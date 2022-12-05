import { prisma } from "@/config";

async function findBooking(userId: number) {
  return prisma.booking.findFirst({
    where: {
      userId
    },
    include: {
      Room: true,
    }
  });
}

async function upsertBooking(userId: number, roomId: number, id: number) {
  return prisma.booking.upsert({
    create: {
      userId,
      roomId
    },
    update: {
      userId,
      roomId
    },
    where: {
      id
    }
  });
}

const bookingRepository = {
  findBooking,
  upsertBooking,
};

export default bookingRepository;
