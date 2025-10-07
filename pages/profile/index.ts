// pages/profile/index.ts
import { GetServerSidePropsContext } from "next";
import { getServerSupabaseClient } from "@/lib/supabaseServer";
import { prisma } from "@/lib/prisma";

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const supabase = getServerSupabaseClient(ctx);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return {
      redirect: { destination: "/auth/signin?redirect=/profile", permanent: false },
    };
  }

  const local = await prisma.user.findUnique({ where: { authId: user.id } });
  if (!local?.username) {
    return { redirect: { destination: "/", permanent: false } };
  }

  return {
    redirect: { destination: `/profile/${local.username}`, permanent: false },
  };
}

export default function ProfileRedirectPage() {
  return null;
}
