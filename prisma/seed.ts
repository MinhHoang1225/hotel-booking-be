import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Bắt đầu xoá dữ liệu cũ...");
  // Xóa theo thứ tự để không dính lỗi khoá ngoại (Foreign Key)
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

  console.log("Đã tạo Dữ liệu Khách sạn & Phòng!");
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
