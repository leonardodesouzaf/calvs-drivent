import hotelRepository from "@/repositories/hotel-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketRepository from "@/repositories/ticket-repository";
import { notFoundError, requestError } from "@/errors";
import { cannotListHotelsError } from "@/errors/cannot-list-hotels-error";
import bookingRepository from "@/repositories/booking-repository";

async function listHotels(userId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) throw requestError(403, "Forbidden");
  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);
  if (!ticket || ticket.status === "RESERVED" || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) throw requestError(403, "Forbidden");
}

async function getBooking(userId: number) {
  await listHotels(userId);
  const booking = await bookingRepository.findBooking(userId);
  if (!booking) throw notFoundError();
  return { id: booking.id, Room: booking.Room };
}

async function postBooking(userId: number, roomId: number) {
  await listHotels(userId);
  const room = await hotelRepository.findRoomById(roomId);
  if (!room) throw requestError(404, "Not Found");
  if (room.capacity === 0) throw requestError(403, "Forbidden");
  await bookingRepository.upsertBooking(userId, roomId, 0);
  const booking = await bookingRepository.findBooking(userId);
  if (!booking) throw notFoundError();
  return booking;
}

async function putBooking(userId: number, roomId: number, bookingId: number) {
  await listHotels(userId);
  const room = await hotelRepository.findRoomById(roomId);
  if (!room) throw requestError(404, "Not Found");
  if (room.capacity === 0) throw requestError(403, "Forbidden");
  const booking = await bookingRepository.findBooking(userId);
  if (!booking) throw requestError(403, "Forbidden");
  await bookingRepository.upsertBooking(userId, roomId, bookingId);
  return booking;
}

const bookingService = {
  getBooking,
  postBooking,
  putBooking
};

export default bookingService;
