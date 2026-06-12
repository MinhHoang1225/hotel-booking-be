import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Bắt đầu xoá dữ liệu cũ...");
  // Xóa theo thứ tự để không dính lỗi khoá ngoại (Foreign Key)
  await prisma.notification.deleteMany();
  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.room.deleteMany();
  await prisma.hotel.deleteMany();
  await prisma.user.deleteMany();

  console.log("Tạo dữ liệu mẫu...");

  // Mật khẩu chung cho dễ test
  const passwordHash = await bcrypt.hash("password123", 12);

  // 1. Tạo tài khoản Admin và Hotel Owner
  const admin = await prisma.user.create({
    data: {
      email: "admin@hotel.com",
      fullName: "System Administrator",
      passwordHash,
      role: "ADMIN",
    },
  });

  const owner = await prisma.user.create({
    data: {
      email: "owner@hotel.com",
      fullName: "John Doe (Owner)",
      passwordHash,
      role: "HOTEL_OWNER",
    },
  });

  console.log("Đã tạo Users!");

  // 2. Tạo các khách sạn & phòng (Trạng thái APPROVED để hiển thị luôn)
  const hotels = [
    {
      ownerId: owner.id,
      name: "Hanoi Paradise Hotel",
      description:
        "Khách sạn 5 sao sang trọng giữa lòng thủ đô Hà Nội. View hồ Hoàn Kiếm tuyệt đẹp.",
      address: "123 Đường Hoàn Kiếm, Hà Nội",
      latitude: 21.028511,
      longitude: 105.804817,
      status: "APPROVED" as const,
      images: [
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      ],
      rooms: {
        create: [
          {
            name: "Standard Double Room",
            description: "Phòng tiêu chuẩn giường đôi, phù hợp cho cặp đôi.",
            price: 50.0,
            capacity: 2,
            amenities: ["Wi-Fi", "TV", "Air Conditioning"],
            images: [
              "https://images.unsplash.com/photo-1590490360182-c33d57733427?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            ],
          },
          {
            name: "Presidential Suite",
            description:
              "Phòng tổng thống rộng lớn với đầy đủ tiện nghi sang trọng.",
            price: 250.0,
            capacity: 4,
            amenities: [
              "Wi-Fi",
              "TV",
              "Air Conditioning",
              "Bathtub",
              "Mini Bar",
              "City View",
            ],
            images: [
              "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            ],
          },
        ],
      },
    },
    {
      ownerId: owner.id,
      name: "Da Nang Ocean Resort",
      description: "Khu nghỉ dưỡng bãi biển tuyệt đẹp tại Đà Nẵng.",
      address: "456 Võ Nguyên Giáp, Đà Nẵng",
      latitude: 16.054407,
      longitude: 108.202164,
      status: "APPROVED" as const,
      images: [
        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      ],
      rooms: {
        create: [
          {
            name: "Ocean View Villa",
            description: "Villa nhìn ra biển Mỹ Khê.",
            price: 120.0,
            capacity: 2,
            amenities: ["Wi-Fi", "Balcony", "Pool Access", "Free Breakfast"],
            images: [
              "https://images.unsplash.com/photo-1584132967334-10e028bd69f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            ],
          },
        ],
      },
    },
  ];

  for (const hotel of hotels) {
    await prisma.hotel.create({ data: hotel });
  }

  console.log("✅ Đã tạo Dữ liệu Khách sạn & Phòng!");

  // 3. Tạo người dùng mẫu để đánh giá
  console.log("Tạo người dùng mẫu để đánh giá...");
  const user1 = await prisma.user.create({
    data: {
      email: "user1@test.com",
      fullName: "Nguyễn Văn A",
      passwordHash,
      role: "USER",
      avatarUrl:
        "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=150&auto=format&fit=crop",
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: "user2@test.com",
      fullName: "Trần Thị B",
      passwordHash,
      role: "USER",
      avatarUrl:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop",
    },
  });

  const user3 = await prisma.user.create({
    data: {
      email: "user3@test.com",
      fullName: "Lê Văn C",
      passwordHash,
      role: "USER",
      avatarUrl:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop",
    },
  });

  // 4. Tạo thêm khách sạn Sapa để có dữ liệu review đa dạng
  const sapaHotel = await prisma.hotel.create({
    data: {
      ownerId: owner.id,
      name: "Sapa Horizon Hotel",
      description: "Khách sạn view núi tại Sapa.",
      address: "111 Fansipan, Sapa",
      latitude: 22.3369,
      longitude: 103.844,
      status: "APPROVED",
      images: [
        "https://images.unsplash.com/photo-1534038313323-212534a207a0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      ],
      rooms: {
        create: [
          {
            name: "Mountain View Bungalow",
            description: "Bungalow nhìn ra dãy Hoàng Liên Sơn.",
            price: 90.0,
            capacity: 2,
            amenities: ["Wi-Fi", "Balcony", "Fireplace"],
            images: [
              "https://images.unsplash.com/photo-1584132967334-10e028bd69f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            ],
          },
        ],
      },
    },
  });

  console.log("✅ Đã tạo người dùng và khách sạn Sapa!");

  // 5. Tạo booking và review mẫu
  console.log("Tạo booking và review mẫu...");
  const hanoiHotel = await prisma.hotel.findFirst({
    where: { name: "Hanoi Paradise Hotel" },
    include: { rooms: true },
  });
  const danangHotel = await prisma.hotel.findFirst({
    where: { name: "Da Nang Ocean Resort" },
    include: { rooms: true },
  });
  const sapaRoom = await prisma.room.findFirst({
    where: { hotelId: sapaHotel.id },
  });

  if (!hanoiHotel || !danangHotel || !sapaRoom) {
    throw new Error("Không tìm thấy khách sạn hoặc phòng để tạo booking mẫu.");
  }

  const reviewsData = [
    {
      user: user1,
      hotel: hanoiHotel,
      room: hanoiHotel.rooms[0],
      comment:
        "Trải nghiệm tuyệt vời! Khách sạn rất đẹp, nhân viên nhiệt tình và phòng ốc sạch sẽ. Chắc chắn tôi sẽ tiếp tục sử dụng Velora cho chuyến đi tới.",
    },
    {
      user: user2,
      hotel: danangHotel,
      room: danangHotel.rooms[0],
      comment:
        "View biển cực kỳ xuất sắc. Đồ ăn sáng ngon và phong phú. Cảm ơn hệ thống đặt phòng đã giúp tôi có một kỳ nghỉ dưỡng thật trọn vẹn và dễ dàng.",
    },
    {
      user: user3,
      hotel: sapaHotel,
      room: sapaRoom,
      comment:
        "Không gian yên tĩnh, lãng mạn. Rất phù hợp cho các cặp đôi. Quá trình tìm kiếm phòng qua hệ thống rất nhanh chóng, giá cả lại vô cùng minh bạch.",
    },
  ];

  for (const r of reviewsData) {
    const booking = await prisma.booking.create({
      data: {
        userId: r.user.id,
        roomId: r.room.id,
        checkIn: new Date(),
        checkOut: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        guests: 2,
        totalPrice: r.room.price * 2,
        status: "CHECKED_OUT",
      },
    });
    await prisma.review.create({
      data: {
        userId: r.user.id,
        bookingId: booking.id,
        hotelId: r.hotel.id,
        rating: 5,
        comment: r.comment,
      },
    });
  }
  console.log("✅ Đã tạo Dữ liệu Đánh giá mẫu!");
  console.log("--- HOÀN TẤT SEED DỮ LIỆU ---");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
