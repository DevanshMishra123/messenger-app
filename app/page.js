import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import ChatClient from "./dashboard/page";
import { redirect } from "next/navigation";
import Navbar from "./components/navbar";

export default async function Home() {
  const session = await getServerSession(authOptions);
  console.log(session);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="bg-[url('/chat-bg.png')] bg-cover bg-center h-screen w-screen">
      <Navbar />
      <ChatClient />;
    </div>
  );
}
