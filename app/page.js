import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import ChatClient from "./dashboard/page";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getServerSession(authOptions);
  console.log(session);

  if (!session) {
    redirect("/login");
  }

  return <ChatClient />;
}