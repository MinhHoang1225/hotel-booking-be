import { z } from "zod";

 const registerDto = z.object({
  body: z.object({
    email: z.string().email("Email không hợp lệ").toLowerCase(),
    password: z.string().min(8, "Mật khẩu phải ít nhất 8 ký tự"),
    fullName: z.string().min(2).max(120),
    role: z.enum(["USER", "HOTEL_OWNER"]).default("USER")
  })
});

 const loginDto = z.object({
  body: z.object({
    email: z.string().email().toLowerCase(),
    password: z.string().min(1)
  })
});

 const googleLoginDto = z.object({
  body: z.object({
    idToken: z.string().min(10),
    role: z.enum(["USER", "HOTEL_OWNER"]).default("USER")
  })
});

export { registerDto, loginDto, googleLoginDto };