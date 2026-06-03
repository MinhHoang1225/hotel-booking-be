import { z } from "zod";

export const userParamsDto = z.object({
  params: z.object({
    id: z.string().min(1, "ID người dùng không được để trống"),
  }),
});

export const updateUserRoleDto = z.object({
  params: z.object({
    id: z.string().min(1, "ID người dùng không được để trống"),
  }),
  body: z.object({
    role: z.enum(["USER", "HOTEL_OWNER", "ADMIN"], {
      required_error: "Vai trò là bắt buộc",
      invalid_type_error: "Vai trò không hợp lệ",
    }),
  }),
});
