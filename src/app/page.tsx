import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth/get-user";

export default async function HomePage() {
  const user = await getAuthUser();
  redirect(user ? "/catalogo" : "/login");
}
