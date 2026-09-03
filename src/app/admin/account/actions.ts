"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/app/admin/actions";
import { imageExtension, validateImageFile } from "@/lib/file-validation";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

export async function updateProfileAvatar(formData: FormData) {
  const { supabase, user } = await requireUser();
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return { error: "Selecciona una imagen" };
  const validationError = validateImageFile(file);
  if (validationError) return { error: validationError };

  const path = `${user.id}/${crypto.randomUUID()}.${imageExtension(file)}`;
  const { error: uploadError } = await supabase.storage
    .from("menu-images")
    .upload(path, file, { contentType: file.type });
  if (uploadError) return { error: "No pudimos subir la imagen" };

  const url = supabase.storage.from("menu-images").getPublicUrl(path).data.publicUrl;
  const { error } = await supabase.auth.updateUser({ data: { avatar_url: url } });
  if (error) return { error: error.message };

  revalidatePath("/admin", "layout");
  return { url };
}

export async function deleteMyAccount(): Promise<ActionState> {
  const { supabase } = await requireUser();
  const { error } = await supabase.rpc("delete_own_account");
  if (error) return { error: "No pudimos borrar la cuenta. Intenta de nuevo." };

  await supabase.auth.signOut();
  redirect("/login");
}
